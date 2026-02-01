require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sshService = require('./services/SSHService');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Singleton SSH Management
let logStream = null;
let pollInterval = null;
let connectedClients = 0;

// Persistent Configuration
const CONFIG_FILE = path.join(__dirname, '..', 'config.json');
let serverConfig = {
    path: '/mcfolder/',
    screenName: 'minecraft',
    startScript: './run.sh',
    stopScript: 'stop'
};

// Load initial config
if (fs.existsSync(CONFIG_FILE)) {
    try {
        const data = fs.readFileSync(CONFIG_FILE);
        serverConfig = { ...serverConfig, ...JSON.parse(data) };
    } catch (e) {
        console.error('Error loading config file:', e);
    }
}

const saveConfig = () => {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(serverConfig, null, 2));
    } catch (e) {
        console.error('Error saving config file:', e);
    }
};

// Smart Command Executor
const executeCommand = async (command) => {
    if (!sshService.connected) throw new Error('SSH not connected');

    const screen = serverConfig.screenName || 'minecraft';
    const screenCommand = `screen -S ${screen} -p 0 -X stuff "${command}\\n"`;

    try {
        await sshService.exec(`screen -list | grep "${screen}"`);
        console.log(`Executing (Screen: ${screen}): ${command}`);
        await sshService.exec(screenCommand);
        return { method: 'screen' };
    } catch (e) {
        if (serverConfig.startScript) {
            console.log(`Executing (Pipe fallback): ${command}`);
            const pipeCmd = `timeout 2s bash -c 'echo "${command}" > ${serverConfig.path}/.mc_pipe'`;
            await sshService.exec(pipeCmd).catch(err => {
                console.warn(`Pipe execution failed or timed out: ${err.message}`);
                throw new Error('Server not responding (no active screen or working pipe).');
            });
            return { method: 'pipe' };
        }
        throw new Error(`Execution failed: Screen session "${screen}" not found and no start script configured.`);
    }
};

// Global SSH Error Handling
sshService.on('error', (err) => {
    io.emit('ssh:error', err.message);
});

sshService.on('close', () => {
    io.emit('ssh:status', { connected: false });
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    if (logStream) {
        logStream.destroy();
        logStream = null;
    }
});

// Cache for player status
let lastKnownVersion = null;
let opList = new Set();

// Log Parsing Logic
const parseLogForPlayers = (logLine) => {
    const lines = logLine.split(/\r?\n/).filter(line => line.trim().length > 0);

    lines.forEach(line => {
        const tpsMatch = line.match(/TPS from last 1m, 5m, 15m: ([\d.]+), ([\d.]+), ([\d.]+)/i);
        const joinMatch = line.match(/: (\w+) joined the game/i);
        const leaveMatch = line.match(/: (\w+) left the game/i);
        const versionMatch = line.match(/Starting minecraft server version (.*)/i) || line.match(/This server is running (.*)/i);

        if (versionMatch) {
            let v = versionMatch[1];
            if (v.includes('(MC:')) {
                const mc = v.match(/\(MC: (.*)\)/);
                if (mc) v = `Paper ${mc[1]}`;
            }
            lastKnownVersion = v;
            io.emit('server:version', v);
        }

        const listMatch = line.match(/(?:players online|There are \d+ of a max \d+ players online): (.*)/i);
        const legacyListMatch = line.match(/Online players \(\d+\): (.*)/i);
        const finalMatch = listMatch || legacyListMatch;

        if (tpsMatch) {
            io.emit('metrics:tps', {
                t1: parseFloat(tpsMatch[1]),
                t5: parseFloat(tpsMatch[2]),
                t15: parseFloat(tpsMatch[3])
            });
        }

        if (finalMatch) {
            const names = finalMatch[1].split(', ').map(n => n.split(' ')[0]).filter(n => n && n.length > 0);
            const playerObjects = names.map(n => ({
                name: n.trim(),
                online: true,
                id: 'un-known-' + Math.random().toString(36).substr(2, 9),
                ip: '127.0.0.1',
                op: opList.has(n.trim().toLowerCase()),
            }));
            io.emit('players:update', playerObjects);
        } else if (joinMatch || leaveMatch) {
            executeCommand('list').catch(() => { });
        }
    });
};

const startMetricsPolling = () => {
    if (pollInterval) return;
    pollInterval = setInterval(async () => {
        if (!sshService.connected) {
            clearInterval(pollInterval);
            pollInterval = null;
            return;
        }
        try {
            const metrics = await sshService.getSystemUsage();
            io.emit('metrics:update', metrics);
        } catch (e) {
            console.warn('Metrics polling failed:', e.message);
        }
    }, 5000);
};

const startLogStream = async () => {
    if (logStream || !sshService.connected) return;

    try {
        const logPath = `${serverConfig.path}/logs/latest.log`;
        await sshService.exec(`mkdir -p ${serverConfig.path}/logs && touch ${logPath}`).catch(() => { });

        const command = `tail -F -n 100 ${logPath}`;
        const stream = await sshService.spawn(command);
        logStream = stream;

        stream.on('data', (data) => {
            const msg = data.toString();
            io.emit('console:log', msg);
            parseLogForPlayers(msg);
        });

        stream.stderr.on('data', (data) => {
            io.emit('console:log', `[Stderr] ${data.toString()}`);
        });

        stream.on('close', () => {
            io.emit('console:log', '\n[System] Terminal stream ended.\n');
            logStream = null;
        });

        stream.on('error', (err) => {
            console.error('Log stream error:', err);
            logStream = null;
        });
    } catch (err) {
        io.emit('console:error', err.message);
    }
};

const fetchPersistentPlayers = async () => {
    if (!sshService.connected) return {};
    const base = serverConfig.path;

    try {
        const opsContent = await sshService.exec(`cat ${base}/ops.json`);
        const ops = JSON.parse(opsContent);
        opList = new Set();
        ops.forEach(o => { if (o.name) opList.add(o.name.toLowerCase()); });
    } catch (e) { }

    const files = [
        { name: 'whitelist', path: `${base}/whitelist.json` },
        { name: 'banned', path: `${base}/banned-players.json` },
        { name: 'cache', path: `${base}/usercache.json` }
    ];

    const results = {};
    for (const f of files) {
        try {
            const content = await sshService.exec(`cat ${f.path}`);
            let list = JSON.parse(content);
            if (f.name === 'cache' || f.name === 'whitelist' || f.name === 'banned') {
                list = list.map(p => ({
                    ...p,
                    name: p.name || p.username,
                    op: opList.has((p.name || p.username || "").toLowerCase())
                }));
            }
            results[f.name] = list;
        } catch (e) {
            results[f.name] = [];
        }
    }
    return results;
};

io.on('connection', (socket) => {
    connectedClients++;
    console.log(`Socket: Client connected (Total: ${connectedClients})`);

    socket.emit('config:current', serverConfig);
    if (lastKnownVersion) socket.emit('server:version', lastKnownVersion);
    socket.emit('ssh:status', { connected: sshService.connected });

    if (sshService.connected) {
        startMetricsPolling();
    }

    socket.on('ssh:connect', async (credentials) => {
        try {
            await sshService.connect(credentials);
            socket.emit('ssh:status', { connected: true });
            startMetricsPolling();
        } catch (err) {
            socket.emit('ssh:error', err.message);
        }
    });

    socket.on('config:update', (config) => {
        serverConfig = { ...serverConfig, ...config };
        saveConfig();
        io.emit('config:current', serverConfig);
        socket.emit('config:ack', { success: true });
    });

    socket.on('ssh:disconnect', () => {
        sshService.disconnect();
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
        if (logStream) {
            logStream.destroy();
            logStream = null;
        }
        io.emit('ssh:status', { connected: false });
    });

    socket.on('console:start', async () => {
        await startLogStream();
        const data = await fetchPersistentPlayers();
        socket.emit('players:data_update', data);
        executeCommand('list').catch(() => { });
    });

    socket.on('players:refresh', async () => {
        const data = await fetchPersistentPlayers();
        socket.emit('players:data_update', data);
    });

    socket.on('console:input', async ({ command }) => {
        try {
            await executeCommand(command);
        } catch (err) {
            socket.emit('console:log', `\n[System Error] ${err.message}\n`);
        }
    });

    socket.on('disconnect', () => {
        connectedClients--;
        console.log(`Socket: Client disconnected (Total: ${connectedClients})`);
        if (connectedClients <= 0) {
            console.log('No clients connected. Stopping background tasks...');
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            if (logStream) {
                logStream.destroy();
                logStream = null;
            }
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Backend [v3.0.7]: Running on port ${PORT}`);
    console.log(`Working Directory: ${process.cwd()}`);
});
