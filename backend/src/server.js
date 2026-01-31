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
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api', apiRoutes);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let logStream = null;
let pollInterval = null;

// Persistent Configuration
const CONFIG_FILE = path.join(__dirname, '..', 'config.json');
let serverConfig = {
    path: '/home/mcserver',
    screenName: 'minecraft'
};

// Load initial config
if (fs.existsSync(CONFIG_FILE)) {
    try {
        const data = fs.readFileSync(CONFIG_FILE);
        serverConfig = { ...serverConfig, ...JSON.parse(data) };
        console.log('Loaded config from file');
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

// Global SSH Error Handling
sshService.on('error', (err) => {
    io.emit('ssh:error', err.message);
});

sshService.on('close', () => {
    io.emit('ssh:status', { connected: false });
    if (pollInterval) clearInterval(pollInterval);
    logStream = null;
});

// Log Parsing Logic
const parseLogForPlayers = (logLine) => {
    // Regex for: [21:05:10] [Server thread/INFO]: Playername joined the game
    // Regex for: [21:05:10] [Server thread/INFO]: Playername left the game
    const tpsMatch = logLine.match(/TPS from last 1m, 5m, 15m: ([\d.]+), ([\d.]+), ([\d.]+)/i);
    const joinMatch = logLine.match(/: (\w+) joined the game/i);
    const leaveMatch = logLine.match(/: (\w+) left the game/i);
    const listMatch = logLine.match(/(?:players online|There are \d+ of a max \d+ players online): (.*)/i);
    const legacyListMatch = logLine.match(/Online players \(\d+\): (.*)/i);
    const finalMatch = listMatch || legacyListMatch;

    if (tpsMatch) {
        io.emit('metrics:tps', {
            t1: parseFloat(tpsMatch[1]),
            t5: parseFloat(tpsMatch[2]),
            t15: parseFloat(tpsMatch[3])
        });
    } else if (finalMatch) {
        const names = finalMatch[1].split(', ').map(n => n.split(' ')[0]).filter(n => n && n.length > 0);
        const playerObjects = names.map(n => ({
            name: n.trim(),
            online: true,
            id: 'un-known-' + Math.random().toString(36).substr(2, 9),
            ip: '127.0.0.1',
            op: false,
        }));
        io.emit('players:update', playerObjects);
    } else if (joinMatch || leaveMatch) {
        // Trigger a 'list' command to get full fresh list
        const cmd = `screen -S ${serverConfig.screenName} -p 0 -X stuff "list\\n"`;
        sshService.exec(cmd).catch(() => { });
    }
};

io.on('connection', (socket) => {
    console.log('Socket: Client connected');
    socket.emit('config:current', serverConfig);
    socket.emit('ssh:status', { connected: sshService.connected });

    socket.on('ssh:connect', async (credentials) => {
        try {
            await sshService.connect(credentials);
            socket.emit('ssh:status', { connected: true });

            if (pollInterval) clearInterval(pollInterval);
            let pollCounter = 0;
            pollInterval = setInterval(async () => {
                if (!sshService.connected) {
                    clearInterval(pollInterval);
                    return;
                }
                const metrics = await sshService.getSystemUsage();
                io.emit('metrics:update', metrics);

                // Request TPS every 10 seconds (every 2 polls)
                pollCounter++;
                if (pollCounter >= 2) {
                    pollCounter = 0;
                    const cmd = `screen -S ${serverConfig.screenName} -p 0 -X stuff "tps\\n"`;
                    sshService.exec(cmd).catch(() => { });
                }
            }, 5000);
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
        if (pollInterval) clearInterval(pollInterval);
        io.emit('ssh:status', { connected: false });
    });

    socket.on('console:start', async () => {
        try {
            if (!sshService.connected) throw new Error('SSH not connected');
            if (logStream) return;

            const logPath = `${serverConfig.path}/logs/latest.log`;
            const command = `tail -f -n 100 ${logPath}`;
            const stream = await sshService.spawn(command);
            logStream = stream;

            stream.on('data', (data) => {
                const msg = data.toString();
                socket.emit('console:log', msg);
                parseLogForPlayers(msg);
            });

            stream.stderr.on('data', (data) => {
                socket.emit('console:log', `[Stderr] ${data.toString()}`);
            });

            stream.on('close', () => {
                socket.emit('console:log', '\n[System] Terminal stream ended.\n');
                logStream = null;
            });

            // Initial player list
            const cmd = `screen -S ${serverConfig.screenName} -p 0 -X stuff "list\\n"`;
            sshService.exec(cmd).catch(() => { });

            // Fetch permanent lists
            const data = await fetchPersistentPlayers();
            socket.emit('players:data_update', data);
        } catch (err) {
            socket.emit('console:error', err.message);
        }
    });

    const fetchPersistentPlayers = async () => {
        if (!sshService.connected) return {};
        const base = serverConfig.path;
        const files = [
            { name: 'whitelist', path: `${base}/whitelist.json` },
            { name: 'banned', path: `${base}/banned-players.json` },
            { name: 'cache', path: `${base}/usercache.json` }
        ];

        const results = {};
        for (const f of files) {
            try {
                const content = await sshService.exec(`cat ${f.path}`);
                results[f.name] = JSON.parse(content);
            } catch (e) {
                results[f.name] = [];
            }
        }
        return results;
    };

    socket.on('players:refresh', async () => {
        const data = await fetchPersistentPlayers();
        socket.emit('players:data_update', data);
    });

    socket.on('console:input', async ({ command }) => {
        try {
            if (!sshService.connected) {
                socket.emit('console:log', '\n[System] SSH not connected.\n');
                return;
            }

            // Step 1: Check if screen session exists
            const checkSession = `screen -list | grep "${serverConfig.screenName}"`;
            try {
                await sshService.exec(checkSession);
            } catch (e) {
                socket.emit('console:log', `\n[System Error] Screen session "${serverConfig.screenName}" not found. Is the server running?\n`);
                return;
            }

            // Step 2: Execute command
            console.log(`Executing in screen "${serverConfig.screenName}": ${command}`);
            // Use \n instead of \r for better linux compatibility
            const cmd = `screen -S ${serverConfig.screenName} -p 0 -X stuff "${command}\\n"`;
            await sshService.exec(cmd);
        } catch (err) {
            console.error('Console error:', err.message);
            socket.emit('console:log', `\n[System Error] ${err.message}\n`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket: Client disconnected');
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Backend: Running on port ${PORT}`);
});
