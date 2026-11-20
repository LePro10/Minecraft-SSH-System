// Demo-Backend mit Fake-Daten – ersetzt backend/src/server.js, kein SSH nötig.
// Start: node mock/mock-server.js  (Port 3001)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const upload = multer({ storage: multer.memoryStorage() });

const BASE = '/home/serverusr/mcserver';
let serverConfig = { path: BASE, screenName: 'minecraft', startScript: './start.sh', stopScript: 'stop' };
let settings = { ...serverConfig, theme: 'glass' };
let sshConnected = true;
let serverRunning = true;

// ---------- Hilfsfunktionen ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const ts = () => new Date().toTimeString().slice(0, 8);
const log = (msg, lvl = 'INFO') => io.emit('console:log', `[${ts()}] [Server thread/${lvl}]: ${msg}\n`);
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
});

// ---------- Spieler ----------
const ALL_PLAYERS = ['Steve_Builder', 'AlexTheMiner', 'xX_Creeper_Xx', 'NotchFan2009', 'RedstoneRita', 'DiamondDan', 'EnderLisa', 'PixelPaul', 'BlockQueen', 'LavaLukas'];
const cache = ALL_PLAYERS.map(name => ({ name, uuid: uuid(), expiresOn: '2026-12-01 12:00:00 +0100' }));
const ops = new Set(['steve_builder', 'redstonerita']);
let whitelist = cache.slice(0, 6).map(p => ({ name: p.name, uuid: p.uuid }));
let banned = [{ name: 'GrieferGuy', uuid: uuid(), created: '2026-10-12 18:22:10 +0200', source: 'Steve_Builder', expires: 'forever', reason: 'Griefing am Spawn' }];
let online = ['Steve_Builder', 'AlexTheMiner', 'RedstoneRita', 'DiamondDan'];

const withOp = list => list.map(p => ({ ...p, op: ops.has(p.name.toLowerCase()) }));
const playerData = () => ({ whitelist: withOp(whitelist), banned: withOp(banned), cache: withOp(cache) });
const onlineObjects = () => online.map(name => ({ name, online: true, id: 'demo-' + name, ip: `192.168.1.${10 + ALL_PLAYERS.indexOf(name)}`, op: ops.has(name.toLowerCase()) }));
const emitPlayers = () => {
    io.emit('players:update', onlineObjects());
    io.emit('players:data_update', playerData());
};

// ---------- Konsole ----------
const CHAT = ['hi zusammen!', 'wer hat Diamanten?', 'lol', 'kommt jemand mit ins Nether?', 'gg', 'die Farm läuft endlich', 'brb', 'wo ist das Dorf?', 'nice build!'];
const history = () => {
    const lines = [
        'Starting minecraft server version 1.21.1',
        'Loading properties', 'Default game type: SURVIVAL', 'Generating keypair',
        'Starting Minecraft server on *:25565', 'This server is running Paper version 1.21.1-130 (MC: 1.21.1)',
        '[LuckPerms] Enabling LuckPerms v5.4.141', '[Vault] Enabling Vault v1.7.3-b131',
        '[EssentialsX] Enabling Essentials v2.20.1', '[WorldEdit] Enabling WorldEdit v7.3.6',
        '[CoreProtect] CoreProtect has been successfully enabled!', 'Preparing level "world"',
        'Preparing spawn area: 100%', 'Done (4.213s)! For help, type "help"',
    ];
    online.forEach(n => { lines.push(`${n} joined the game`); });
    lines.push(`<${online[0]}> Moin!`, `<${online[1]}> hey :)`);
    return lines.map(l => `[${ts()}] [Server thread/INFO]: ${l}\n`).join('');
};

const runCommand = (raw) => {
    const cmd = raw.trim().replace(/^\//, '');
    const [c, ...args] = cmd.split(/\s+/);
    io.emit('console:log', `> ${cmd}\n`);
    if (!serverRunning && c !== 'start') return log('Server is not running.', 'WARN');
    switch (c.toLowerCase()) {
        case 'list': return log(`There are ${online.length} of a max 20 players online: ${online.join(', ')}`);
        case 'tps': return log('TPS from last 1m, 5m, 15m: 20.0, 19.98, 19.97');
        case 'say': return log(`[Server] ${args.join(' ')}`);
        case 'op': ops.add((args[0] || '').toLowerCase()); log(`Made ${args[0]} a server operator`); return emitPlayers();
        case 'deop': ops.delete((args[0] || '').toLowerCase()); log(`Made ${args[0]} no longer a server operator`); return emitPlayers();
        case 'kick':
            online = online.filter(n => n !== args[0]);
            log(`Kicked ${args[0]}: ${args.slice(1).join(' ') || 'Kicked by admin'}`); log(`${args[0]} left the game`);
            return emitPlayers();
        case 'ban':
            online = online.filter(n => n !== args[0]);
            banned.push({ name: args[0], uuid: uuid(), created: new Date().toISOString(), source: 'Server', expires: 'forever', reason: args.slice(1).join(' ') || 'Banned by admin' });
            log(`Banned ${args[0]}: ${args.slice(1).join(' ') || 'Banned by admin'}`);
            return emitPlayers();
        case 'pardon':
            banned = banned.filter(b => b.name !== args[0]); log(`Unbanned ${args[0]}`); return emitPlayers();
        case 'whitelist':
            if (args[0] === 'add' && args[1]) { whitelist.push({ name: args[1], uuid: uuid() }); log(`Added ${args[1]} to the whitelist`); }
            else if (args[0] === 'remove' && args[1]) { whitelist = whitelist.filter(w => w.name !== args[1]); log(`Removed ${args[1]} from the whitelist`); }
            else log(`Whitelist is now turned ${args[0] || 'on'}`);
            return emitPlayers();
        case 'give': return log(`Gave ${args[2] || 1} [${(args[1] || 'stone').replace('minecraft:', '')}] to ${args[0]}`);
        case 'tp': return log(`Teleported ${args[0]} to ${args.slice(1).join(' ')}`);
        case 'gamemode': return log(`Set ${args[1] || 'own'} game mode to ${args[0]} Mode`);
        case 'time': return log(`Set the time to ${args[1] || 'day'}`);
        case 'weather': return log(`Set the weather to ${args[0] || 'clear'}`);
        case 'difficulty': return log(`The difficulty has been set to ${args[0]}`);
        case 'save-all': log('Saving the game (this may take a moment!)'); return log('Saved the game');
        case 'stop': return stopServer();
        case 'help': return log('Commands: list, say, op, deop, kick, ban, pardon, whitelist, give, tp, gamemode, time, weather, save-all, tps, stop');
        default: return log('Unknown or incomplete command, see below for error', 'WARN');
    }
};

const stopServer = () => {
    log('Stopping the server'); log('Stopping server'); log('Saving players');
    online.forEach(n => log(`${n} left the game`));
    online = []; serverRunning = false;
    emitPlayers();
    setTimeout(() => log('ThreadedAnvilChunkStorage: All dimensions are saved'), 500);
};
const startServer = () => {
    serverRunning = true;
    history().split('\n').filter(l => l && !l.includes('joined') && !l.includes('<')).forEach(l => io.emit('console:log', l + '\n'));
    setTimeout(() => {
        online = ['Steve_Builder', 'AlexTheMiner'];
        online.forEach(n => log(`${n} joined the game`));
        emitPlayers();
    }, 2500);
};

// Zufälliges Leben auf dem Server
setInterval(() => {
    if (!sshConnected || !serverRunning) return;
    const r = Math.random();
    const offline = ALL_PLAYERS.filter(n => !online.includes(n));
    if (r < 0.15 && offline.length) {
        const n = pick(offline); online.push(n); log(`${n} joined the game`); emitPlayers();
    } else if (r < 0.25 && online.length > 2) {
        const n = pick(online); online = online.filter(x => x !== n); log(`${n} left the game`); emitPlayers();
    } else if (r < 0.75 && online.length) {
        log(`<${pick(online)}> ${pick(CHAT)}`);
    } else if (online.length) {
        log(`${pick(online)} has made the advancement [${pick(['Stone Age', 'Acquire Hardware', 'Diamonds!', 'We Need to Go Deeper', 'Monster Hunter'])}]`);
    }
}, 4000);

// ---------- Metriken ----------
let cpu = 25, ram = 55;
setInterval(() => {
    if (!sshConnected) return;
    cpu = Math.min(95, Math.max(5, cpu + rnd(-8, 8) + (serverRunning ? 0 : -5)));
    ram = Math.min(90, Math.max(30, ram + rnd(-2, 2)));
    const total = 16000;
    io.emit('metrics:update', {
        cpu: +cpu.toFixed(1), ram: +ram.toFixed(2), ramUsed: Math.round(total * ram / 100), ramTotal: total, ramCache: 2300,
        disk: '42%', diskUsed: '96G', diskTotal: '229G', load: `${(cpu / 40).toFixed(2)} 0.80 0.71`, uptime: 'up 3 days, 7 hours',
    });
    if (serverRunning) io.emit('metrics:tps', { t1: +rnd(18.6, 20).toFixed(2), t5: +rnd(19.2, 20).toFixed(2), t15: 19.9 });
}, 2000);

// ---------- Virtuelles Dateisystem ----------
const PROPS = {
    'motd': 'Demo SMP - Survival 1.21', 'level-name': 'world', 'gamemode': 'survival', 'difficulty': 'normal',
    'level-type': 'minecraft\\:normal', 'max-players': '20', 'server-port': '25565', 'view-distance': '10', 'simulation-distance': '8',
    'pvp': 'true', 'spawn-monsters': 'true', 'spawn-animals': 'true', 'spawn-npcs': 'true', 'white-list': 'false', 'online-mode': 'true',
    'hardcore': 'false', 'allow-flight': 'false', 'allow-nether': 'true', 'enable-command-block': 'false', 'level-seed': '-4172144997902289642',
    'spawn-protection': '16', 'enable-rcon': 'false', 'max-world-size': '29999984', 'sync-chunk-writes': 'true',
};
const propsText = () => '#Minecraft server properties\n#' + new Date().toString() + '\n' + Object.entries(PROPS).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';

const fs = new Map(); // pfad -> { dir, content, mode, mtime, size? }
const now = Date.now();
const mkdir = p => fs.set(p, { dir: true, mode: '755', mtime: now - rnd(0, 9e8) });
const mkfile = (p, content, size) => fs.set(p, { dir: false, content, size, mode: '644', mtime: now - rnd(0, 9e8) });
['/', '/home', '/home/serverusr', BASE, `${BASE}/world`, `${BASE}/world/region`, `${BASE}/world/data`, `${BASE}/world_nether`, `${BASE}/world_the_end`,
    `${BASE}/logs`, `${BASE}/plugins`, `${BASE}/plugins/Essentials`, `${BASE}/plugins/LuckPerms`, `${BASE}/plugins/WorldEdit`, `${BASE}/config`, `${BASE}/libraries`].forEach(mkdir);
mkfile('/home/serverusr/.bashrc', '# ~/.bashrc\nexport PATH=$PATH:~/bin\n');
mkfile(`${BASE}/server.properties`, null);
mkfile(`${BASE}/eula.txt`, '#By changing the setting below to TRUE you are indicating your agreement to our EULA.\neula=true\n');
mkfile(`${BASE}/start.sh`, '#!/bin/bash\nscreen -dmS minecraft java -Xms4G -Xmx8G -jar paper-1.21.1-130.jar nogui\n'); fs.get(`${BASE}/start.sh`).mode = '755';
mkfile(`${BASE}/paper-1.21.1-130.jar`, '', 49_283_112);
mkfile(`${BASE}/bukkit.yml`, 'settings:\n  allow-end: true\n  warn-on-overload: true\n  connection-throttle: 4000\nspawn-limits:\n  monsters: 70\n  animals: 10\n');
mkfile(`${BASE}/spigot.yml`, 'settings:\n  debug: false\n  restart-on-crash: true\nworld-settings:\n  default:\n    view-distance: default\n');
mkfile(`${BASE}/ops.json`, null); mkfile(`${BASE}/whitelist.json`, null); mkfile(`${BASE}/banned-players.json`, null); mkfile(`${BASE}/usercache.json`, null);
mkfile(`${BASE}/config/paper-global.yml`, '_version: 29\nchunk-loading-basic:\n  autoconfig-send-distance: true\nproxies:\n  velocity:\n    enabled: false\n');
mkfile(`${BASE}/logs/latest.log`, null);
mkfile(`${BASE}/logs/2026-10-23-1.log.gz`, '', 18_422);
mkfile(`${BASE}/logs/2026-10-22-1.log.gz`, '', 21_903);
mkfile(`${BASE}/world/level.dat`, '', 4_211);
mkfile(`${BASE}/world/session.lock`, '', 3);
for (let x = -2; x <= 1; x++) for (let z = -2; z <= 1; z++) mkfile(`${BASE}/world/region/r.${x}.${z}.mca`, '', Math.round(rnd(2e6, 9e6)));
mkfile(`${BASE}/world/data/raids.dat`, '', 112);
mkfile(`${BASE}/plugins/Essentials/config.yml`, 'ops-name-color: \'4\'\nnickname-prefix: \'~\'\nteleport-cooldown: 0\nteleport-delay: 3\nhome-limits:\n  default: 3\n');
mkfile(`${BASE}/plugins/LuckPerms/config.yml`, 'server: global\nstorage-method: h2\n');
mkfile(`${BASE}/plugins/WorldEdit/config.yml`, 'limits:\n  max-blocks-changed:\n    default: -1\n');
const PLUGIN_JARS = ['EssentialsX-2.20.1.jar', 'LuckPerms-Bukkit-5.4.141.jar', 'Vault.jar', 'worldedit-bukkit-7.3.6.jar', 'CoreProtect-22.4.jar'];
PLUGIN_JARS.forEach(j => mkfile(`${BASE}/plugins/${j}`, '', Math.round(rnd(3e5, 4e6))));

// Dynamische Inhalte (aktuelle Spieler/Properties)
const dynamicContent = p => {
    switch (p) {
        case `${BASE}/server.properties`: return propsText();
        case `${BASE}/ops.json`: return JSON.stringify([...ops].map(n => ({ uuid: uuid(), name: ALL_PLAYERS.find(a => a.toLowerCase() === n) || n, level: 4, bypassesPlayerLimit: false })), null, 2);
        case `${BASE}/whitelist.json`: return JSON.stringify(whitelist, null, 2);
        case `${BASE}/banned-players.json`: return JSON.stringify(banned, null, 2);
        case `${BASE}/usercache.json`: return JSON.stringify(cache, null, 2);
        case `${BASE}/logs/latest.log`: return history();
    }
    return null;
};
const content = p => { const d = dynamicContent(p); return d !== null ? d : (fs.get(p)?.content ?? ''); };
const norm = p => (path.posix.normalize(p || '/').replace(/\/+$/, '') || '/');
const parentOf = p => path.posix.dirname(p);
const ensureParents = p => { let d = parentOf(p); const stack = []; while (!fs.has(d)) { stack.push(d); d = parentOf(d); } stack.reverse().forEach(mkdir); };

const api = express.Router();

// Settings
api.get('/settings', (req, res) => res.json(settings));
api.post('/settings', (req, res) => { settings = { ...settings, ...req.body }; res.json(settings); });
const wallpapers = new Map();
api.post('/settings/wallpaper', upload.single('wallpaper'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const name = 'wallpaper-' + Date.now() + path.extname(req.file.originalname);
    wallpapers.set(name, req.file);
    settings.wallpaper = `/uploads/${name}`;
    res.json({ success: true, url: settings.wallpaper, wallpaper: settings.wallpaper });
});
app.get('/uploads/:name', (req, res) => {
    const f = wallpapers.get(req.params.name);
    if (!f) return res.status(404).end();
    res.type(f.mimetype).send(f.buffer);
});

// Dateien
api.get('/files/list', (req, res) => {
    const dir = norm(req.query.path);
    if (!fs.has(dir)) return res.status(500).json({ error: 'SFTP Error: No such file' });
    const items = [...fs.entries()]
        .filter(([p]) => p !== '/' && parentOf(p) === dir)
        .map(([p, n]) => ({ name: path.posix.basename(p), isDirectory: n.dir, size: n.dir ? 4096 : (n.size ?? Buffer.byteLength(content(p))), mtime: n.mtime, permissions: n.mode }))
        .sort((a, b) => (a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1));
    res.json(items);
});
api.get('/files/read', (req, res) => res.type('text/plain').send(content(norm(req.query.path))));
api.get('/files/download', (req, res) => {
    const p = norm(req.query.path);
    res.setHeader('Content-disposition', `attachment; filename="${path.posix.basename(p)}"`);
    res.type('application/octet-stream').send(content(p));
});
api.post('/files/download-bulk', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename="demo-selection.txt"');
    res.type('text/plain').send('Demo-Modus: hier würde ein .tar.gz mit\n' + (req.body.paths || []).join('\n') + '\n');
});
api.post('/files/write', (req, res) => {
    const p = norm(req.body.path);
    if (p === `${BASE}/server.properties`) {
        req.body.content.split(/\r?\n/).forEach(l => { const i = l.indexOf('='); if (i > 0 && !l.startsWith('#')) PROPS[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
    } else {
        const n = fs.get(p) || { dir: false, mode: '644' };
        fs.set(p, { ...n, content: req.body.content, size: undefined, mtime: Date.now() });
    }
    res.json({ success: true });
});
api.post('/files/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const p = norm(`${req.body.targetDir}/${req.file.originalname}`);
    fs.set(p, { dir: false, content: req.file.buffer.toString('utf8'), size: req.file.size, mode: '644', mtime: Date.now() });
    res.json({ success: true });
});
api.post('/files/delete', (req, res) => {
    const p = norm(req.body.path);
    [...fs.keys()].forEach(k => { if (k === p || k.startsWith(p + '/')) fs.delete(k); });
    res.json({ success: true });
});
const moveOrCopy = (keep) => (req, res) => {
    const src = norm(req.body.src), dest = norm(req.body.dest);
    if (!fs.has(src)) return res.status(500).json({ error: 'No such file' });
    ensureParents(dest);
    [...fs.entries()].forEach(([k, n]) => {
        if (k === src || k.startsWith(src + '/')) {
            fs.set(dest + k.slice(src.length), { ...n, content: content(k), mtime: Date.now() });
            if (!keep) fs.delete(k);
        }
    });
    res.json({ success: true });
};
api.post('/files/move', moveOrCopy(false));
api.post('/files/copy', moveOrCopy(true));
api.post('/files/chmod', (req, res) => {
    const n = fs.get(norm(req.body.path));
    if (!n) return res.status(500).json({ error: 'No such file' });
    n.mode = String(req.body.mode).slice(-3); res.json({ success: true });
});
api.post('/files/create-dir', (req, res) => { const p = norm(req.body.path); ensureParents(p); mkdir(p); fs.get(p).mtime = Date.now(); res.json({ success: true }); });
api.post('/files/create-file', (req, res) => { const p = norm(req.body.path); ensureParents(p); mkfile(p, ''); fs.get(p).mtime = Date.now(); res.json({ success: true }); });

// Plugins (Fake-Spiget-Katalog)
const STORE = [
    ['EssentialsX', 'The essential plugin suite for Minecraft servers.', 2_910_442, '2.20.1'],
    ['LuckPerms', 'An advanced permissions plugin for Bukkit/Spigot, BungeeCord and more.', 1_802_331, '5.4.141'],
    ['Vault', 'Vault is a Permissions, Chat, & Economy API.', 3_400_120, '1.7.3'],
    ['WorldEdit', 'In-game Minecraft map editor.', 4_120_998, '7.3.6'],
    ['CoreProtect', 'Fast, efficient data logging and anti-griefing tool.', 1_201_887, '22.4'],
    ['PlaceholderAPI', 'Allows plugins to share placeholders.', 2_455_031, '2.11.6'],
    ['ProtocolLib', 'Provides read and write access to the Minecraft protocol.', 3_002_115, '5.3.0'],
    ['ViaVersion', 'Allow newer clients to join older server versions.', 1_990_210, '5.1.1'],
    ['WorldGuard', 'Protect your regions and build safely.', 2_877_402, '7.0.12'],
    ['Multiverse-Core', 'The original multi-world plugin.', 1_340_993, '4.3.14'],
    ['Citizens', 'The original NPC plugin for Minecraft.', 987_221, '2.0.35'],
    ['GriefPrevention', 'Self-service anti-griefing for your players.', 756_402, '16.18.4'],
    ['Chunky', 'Pre-generates chunks, quickly and efficiently.', 512_330, '1.4.16'],
    ['TAB', 'Tablist prefixes/suffixes, header/footer, scoreboard and more.', 688_902, '4.1.8'],
    ['DiscordSRV', 'Discord <-> Minecraft chat bridge.', 1_103_455, '1.28.0'],
    ['Geyser', 'Allows Bedrock clients to join Java servers.', 899_120, '2.4.4'],
    ['spark', 'A performance profiler for Minecraft clients, servers and proxies.', 455_002, '1.10.73'],
    ['ShopGUIPlus', 'The best GUI shop plugin.', 120_334, '1.98.0', true],
].map(([name, tagline, downloads, version, premium], i) => ({ id: 1000 + i, name, tagline, downloads, version: { name: version }, premium: !!premium, icon: null }));
let installed = PLUGIN_JARS.map(j => j.toLowerCase());
const syncPluginFiles = () => {
    [...fs.keys()].filter(k => parentOf(k) === `${BASE}/plugins` && k.endsWith('.jar')).forEach(k => fs.delete(k));
    installed.forEach(j => mkfile(`${BASE}/plugins/${j}`, '', Math.round(rnd(3e5, 4e6))));
};

api.get('/plugins/search', (req, res) => {
    const q = (req.query.query || '').toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const list = STORE.filter(p => !q || p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q));
    setTimeout(() => res.json(list.slice((page - 1) * 24, page * 24)), 400);
});
api.get('/plugins/installed', (req, res) => res.json(installed));
api.post('/plugins/install', (req, res) => {
    const name = req.body.resourceName || 'Plugin';
    setTimeout(() => {
        installed.push(`${name.replace(/\s+/g, '').toLowerCase()}.jar`); syncPluginFiles();
        log(`[PluginManager] ${name} downloaded to /plugins (restart required)`);
        res.json({ success: true, message: `${name} installed.` });
    }, 1200);
});
api.post('/plugins/uninstall', (req, res) => {
    const name = (req.body.resourceName || '').toLowerCase();
    installed = installed.filter(j => j !== name && !j.includes(name.replace(/\.jar$/, '')));
    syncPluginFiles();
    res.json({ success: true, message: `${req.body.resourceName} uninstalled.` });
});

// Minecraft
api.post('/mc/command', (req, res) => { runCommand(req.body.command || ''); res.json({ success: true }); });
api.get('/mc/players', (req, res) => res.json(onlineObjects()));
api.post('/mc/control', (req, res) => {
    const { action } = req.body;
    if (action === 'stop') stopServer();
    else if (action === 'start') { if (!serverRunning) setTimeout(startServer, 1500); }
    else if (action === 'restart') { stopServer(); setTimeout(startServer, 3000); }
    else if (action === 'kill') { log('Process killed (SIGKILL)', 'WARN'); online = []; serverRunning = false; emitPlayers(); }
    res.json({ success: true });
});
api.get('/mc/properties', (req, res) => {
    const values = Object.fromEntries(Object.entries(PROPS).map(([k, v]) => [k, v.replace(/\\:/g, ':')]));
    res.json({ values, metadata: PROPERTY_META });
});
api.post('/mc/properties', (req, res) => {
    Object.assign(PROPS, req.body.properties || {});
    log('server.properties saved (restart to apply)');
    res.json({ success: true });
});

const PROPERTY_META = {
    'difficulty': { type: 'enum', options: ['peaceful', 'easy', 'normal', 'hard'], desc: 'The overall difficulty of the server.' },
    'gamemode': { type: 'enum', options: ['survival', 'creative', 'adventure', 'spectator'], desc: 'The default game mode for new players.' },
    'level-type': { type: 'enum', options: ['minecraft:normal', 'minecraft:flat', 'minecraft:large_biomes', 'minecraft:amplified', 'minecraft:single_biome_surface'], desc: 'The world generation algorithm.' },
    'pvp': { type: 'boolean', desc: 'Allows players to damage each other.' },
    'spawn-monsters': { type: 'boolean', desc: 'Whether monsters will spawn naturally.' },
    'spawn-animals': { type: 'boolean', desc: 'Whether animals will spawn naturally.' },
    'spawn-npcs': { type: 'boolean', desc: 'Whether Villagers will spawn.' },
    'white-list': { type: 'boolean', desc: 'If enabled, only whitelisted players can join.' },
    'online-mode': { type: 'boolean', desc: 'Authenticates players against Mojang servers.' },
    'hardcore': { type: 'boolean', desc: 'World is deleted and players banned on death.' },
    'allow-flight': { type: 'boolean', desc: 'Allows players to use flight mods.' },
    'allow-nether': { type: 'boolean', desc: 'Allows players to travel to the Nether.' },
    'enable-command-block': { type: 'boolean', desc: 'Enables command blocks.' },
    'max-players': { type: 'number', min: 1, max: 9999, desc: 'Maximum concurrent player limit.' },
    'server-port': { type: 'number', min: 1, max: 65535, desc: 'The network port for connections.' },
    'view-distance': { type: 'number', min: 2, max: 32, desc: 'Chunks sent to the player.' },
    'simulation-distance': { type: 'number', min: 2, max: 32, desc: 'Distance for ticking entities/blocks.' },
    'motd': { type: 'string', desc: 'The Message of the Day shown in server lists.' },
    'level-name': { type: 'string', desc: 'The name of the world folder.' },
};

app.use('/api', api);

// ---------- Socket ----------
io.on('connection', (socket) => {
    socket.emit('config:current', serverConfig);
    socket.emit('server:version', 'Paper 1.21.1');
    socket.emit('ssh:status', { connected: sshConnected });

    socket.on('ssh:connect', () => setTimeout(() => {
        sshConnected = true;
        io.emit('ssh:status', { connected: true });
    }, 900));
    socket.on('ssh:disconnect', () => { sshConnected = false; io.emit('ssh:status', { connected: false }); });
    socket.on('config:update', (cfg) => {
        serverConfig = { ...serverConfig, ...cfg };
        io.emit('config:current', serverConfig);
        socket.emit('config:ack', { success: true });
    });
    socket.on('console:start', () => {
        if (serverRunning) history().split('\n').filter(Boolean).forEach(l => socket.emit('console:log', l + '\n'));
        else socket.emit('console:log', `[${ts()}] [System]: Server is stopped. Press Start.\n`);
        socket.emit('players:data_update', playerData());
        socket.emit('players:update', onlineObjects());
    });
    socket.on('players:refresh', () => socket.emit('players:data_update', playerData()));
    socket.on('console:input', ({ command }) => runCommand(command || ''));
});

server.listen(3001, () => console.log('MOCK-Backend (Fake-Daten) läuft auf Port 3001'));
