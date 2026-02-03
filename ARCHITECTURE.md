# System Architecture - Minecraft SSH Management v3.0

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER'S BROWSER                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  React Frontend (Port 80 via Nginx)                             │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  Dynamic API Detection                                    │   │   │
│  │  │  API_URL = `http://${window.location.hostname}:3001`     │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  Components:                                                     │   │
│  │  • Dashboard    • FileManager    • PlayerManager                │   │
│  │  • PluginStore  • ServerProps    • Settings                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              │ HTTP/WebSocket                            │
│                              ▼                                           │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               │ Auto-detected connection
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                    Docker Container (Backend)                            │
│                    Node.js Express + Socket.io                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  SmartSSHService (Port 3001)                                   │    │
│  │                                                                 │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │  connect(config) {                                        │ │    │
│  │  │    if (isLocalhost(config.host)) {                       │ │    │
│  │  │      // LOCAL MODE                                       │ │    │
│  │  │      this.isLocal = true;                                │ │    │
│  │  │      return Promise.resolve(true);                       │ │    │
│  │  │    } else {                                              │ │    │
│  │  │      // REMOTE MODE                                      │ │    │
│  │  │      return this.client.connect(config);  // SSH2        │ │    │
│  │  │    }                                                      │ │    │
│  │  │  }                                                        │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  │                                                                 │    │
│  │  Decision Router:                                              │    │
│  │  ┌──────────────┐              ┌─────────────────────┐        │    │
│  │  │ Input: Host  │──────────────│ Is 127.0.0.1 or     │        │    │
│  │  │              │              │ localhost?          │        │    │
│  │  └──────────────┘              └──────┬──────────────┘        │    │
│  │                                       │                        │    │
│  │                    ┌──────────────────┴──────────────┐        │    │
│  │                    │                                  │        │    │
│  │                   YES                                NO        │    │
│  │                    │                                  │        │    │
│  │                    ▼                                  ▼        │    │
│  │         ┌──────────────────┐            ┌─────────────────┐   │    │
│  │         │  LOCAL MODE      │            │  REMOTE MODE    │   │    │
│  │         │  child_process   │            │  SSH2 Library   │   │    │
│  │         │  (spawn)         │            │  (encrypted)    │   │    │
│  │         └────────┬─────────┘            └────────┬────────┘   │    │
│  │                  │                               │            │    │
│  │                  └───────────┬───────────────────┘            │    │
│  │                              │                                │    │
│  │                              ▼                                │    │
│  │                   ┌────────────────────┐                      │    │
│  │                   │ Command Executor   │                      │    │    │
│  │                   └─────────┬──────────┘                      │    │
│  └──────────────────────────────┼──────────────────────────────── │    │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
                                   │ Host Network Mode
                                   │ (network_mode: "host")
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                          HOST SYSTEM (Ubuntu/Linux)                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  LOCAL EXECUTION (127.0.0.1)                                │      │
│  │  ┌────────────────────────────────────────────────────────┐ │      │
│  │  │  bash -c "cd /home/mcserver && screen -r minecraft"   │ │      │
│  │  │  ▲ Direct command execution via spawn()                │ │      │
│  │  │  ▲ No SSH encryption overhead                         │ │      │
│  │  │  ▲ Maximum performance                                │ │      │
│  │  └────────────────────────────────────────────────────────┘ │      │
│  │                                                              │      │
│  │  /home/mcserver/                                             │      │
│  │  ├── server.jar                                              │      │
│  │  ├── start.sh                                                │      │
│  │  ├── plugins/                                                │      │
│  │  └── world/                                                  │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│                                OR                                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  SSH SERVER (Port 22)                                        │      │
│  │  Accepts remote connections from SmartSSHService             │      │
│  └─────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ SSH Connection (for remote servers)
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    REMOTE MINECRAFT SERVER (Optional)                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │  SSH Server (Port 22)                                        │      │
│  │  ▲ Receives encrypted commands via SSH2                     │      │
│  │  ▲ Full SSH security                                         │      │
│  │  ▲ Can be anywhere on the internet                          │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  /home/mcserver/                                                        │
│  ├── server.jar                                                         │
│  ├── start.sh                                                           │
│  ├── plugins/                                                           │
│  └── world/                                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

## Network Flow

### Scenario 1: Local Server (Same Machine)

```
Browser (any IP) ──HTTP──▶ Frontend (Port 80)
                              │
                              │ API Call
                              ▼
                          Backend (Port 3001)
                              │
                              │ SmartSSHService detects 127.0.0.1
                              ▼
                          LOCAL MODE
                              │
                              │ child_process.spawn()
                              ▼
                          Host Linux Shell
                              │
                              ▼
                          Minecraft Server
```

### Scenario 2: Remote Server (Different Machine)

```
Browser (any IP) ──HTTP──▶ Frontend (Port 80)
                              │
                              │ API Call
                              ▼
                          Backend (Port 3001)
                              │
                              │ SmartSSHService detects remote IP
                              ▼
                          REMOTE MODE
                              │
                              │ SSH2 encrypted connection
                              ▼
                          Remote SSH Server (Port 22)
                              │
                              ▼
                          Remote Minecraft Server
```

## Docker Architecture

### Host Network Mode Benefits

```
Traditional Docker Bridge:
┌─────────────┐         ┌─────────────┐         ┌──────────┐
│  Frontend   │ ──► Bridge Network ──► │  Backend    │ ──► Can't reach
│  Container  │         (10.0.0.x)     │  Container  │     host SSH
└─────────────┘                        └─────────────┘

Host Network Mode:
┌─────────────┐                        ┌─────────────┐
│  Frontend   │ ──► Shares host        │  Backend    │ ──► Direct access
│  Container  │     network stack      │  Container  │     to host SSH
│  (Port 80)  │                        │  (Port 3001)│     (Port 22)
└─────────────┘                        └─────────────┘
         │                                     │
         └──────────── Host System ────────────┘
```

## Data Flow Examples

### File Manager Operation

```
1. User clicks "Edit file" in browser
   ▼
2. Frontend sends API request: GET /api/files/read?path=/home/mcserver/server.properties
   ▼
3. Backend SmartSSHService.getSftp()
   │
   ├─▶ If Local: Returns LocalFSAdapter (uses fs.readFile)
   │             ▼
   │          Host filesystem directly accessed
   │
   └─▶ If Remote: Returns SSH2 SFTP session
                 ▼
              Encrypted SFTP transfer from remote server
   ▼
4. File content returned to frontend
   ▼
5. User sees file in editor
```

### Console Command Execution

```
1. User types "list" in console
   ▼
2. Frontend emits: socket.emit('console:input', { command: 'list' })
   ▼
3. Backend receives via Socket.io
   ▼
4. SmartSSHService.exec('screen -r minecraft -X stuff "list\n"')
   │
   ├─▶ If Local: spawn('bash', ['-c', 'screen -r minecraft -X stuff "list\n"'])
   │             ▼
   │          Direct execution on host
   │
   └─▶ If Remote: client.exec('screen -r minecraft -X stuff "list\n"')
                 ▼
              Sent via SSH to remote server
   ▼
5. Output streamed back via Socket.io
   ▼
6. User sees result in console
```

## File Structure

```
mc-ssh-system/
│
├── docker-compose.yml          # Host network configuration
│   ├── backend: network_mode: "host"
│   └── frontend: network_mode: "host"
│
├── backend.Dockerfile          # Node.js backend image
├── frontend.Dockerfile         # Nginx + React frontend image (NO VITE_API_URL!)
│
├── install.sh                  # Universal installer
│   ├── Checks Docker
│   ├── Installs if needed
│   ├── Creates directories
│   ├── Sets permissions
│   └── Deploys with docker compose
│
├── src/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── SmartSSHService.js    # ★ Smart routing logic
│   │   │   │   └── LocalFSAdapter.js     # ★ Local FS adapter
│   │   │   ├── controllers/
│   │   │   └── server.js
│   │   ├── config.json                    # Server configuration
│   │   └── uploads/                       # Plugin icons, etc.
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/                # ★ All use dynamic API URL
│       │   ├── context/
│       │   │   └── SocketContext.jsx      # ★ Dynamic socket connection
│       │   ├── config/
│       │   │   └── api.js                 # ★ Central API config
│       │   └── App.jsx
│       └── package.json
│
├── README.md                   # Complete documentation
├── IMPLEMENTATION.md           # Technical details (German)
└── QUICKSTART.md               # Quick reference (German)
```

## Key Innovation Points

### 1. Smart SSH Service
- **Detects** localhost vs remote automatically
- **Routes** to child_process or SSH2 accordingly
- **Optimizes** performance for local servers

### 2. Dynamic API Detection
- **No hardcoded** URLs anywhere
- **Uses** `window.location.hostname`
- **Works** from any network location

### 3. Host Networking
- **Simplifies** Docker network complexity
- **Enables** direct SSH access
- **Eliminates** port mapping issues

### 4. Zero Configuration
- **One command** installs everything
- **Automatic** permissions and structure
- **User** only needs to enter SSH credentials

---

This architecture enables **true zero-configuration deployment** while maintaining full flexibility for both local and remote server management.
