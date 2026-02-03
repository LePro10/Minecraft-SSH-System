# Minecraft SSH System (SMM) v3.0

A **zero-config**, premium Minecraft server management dashboard that seamlessly manages both local and remote servers via intelligent SSH routing. Built with the stunning \"Liquid Glass 2.0\" aesthetic for a modern, fluid user experience.

## ✨ Key Features

### 🔧 Zero-Configuration Installation
- **One-Line Installer**: Deploy the entire system with a single command
- **Auto-Detects Environment**: Automatically switches between local and remote execution
- **Smart SSH Routing**: No SSH overhead for local servers (uses direct process execution)
- **Dynamic API Discovery**: Frontend automatically finds the backend, no matter where it's deployed

### 🎮 Complete Server Management
- **Real-time Console**: Interactive terminal with live log streaming and command history
- **File Manager**: Full remote filesystem access (upload, download, edit, chmod, drag & drop)
- **Player Management**: Monitor online players, manage whitelist, OP status, kicks, and bans
- **Plugin Store**: Browse and install plugins directly from Spigot with filtering
- **Server Properties**: Visual editor for server.properties with category grouping
- **System Metrics**: Real-time CPU, RAM, Disk, TPS monitoring with live charts

### 🎨 Premium UI/UX
- **Liquid Glass 2.0 Design**: Material fluidity, dynamic lighting, glassmorphism
- **8 Premium Themes**: Sakura, Obsidian, Glass, Gold, Forest, Nebula, Sunset, Coder
- **Customizable Layouts**: Drag-and-drop dashboard widgets with persistent layouts
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## 🚀 Quick Start (Zero-Config)

### Option 1: Universal One-Liner (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/LePro10/Minecraft-SSH-System/main/install.sh | bash
```

That's it! The installer will:
1. ✅ Check and install Docker if needed
2. ✅ Create the project directory at `~/mc-ssh-system`
3. ✅ Set up all required permissions
4. ✅ Build and deploy the entire system
5. ✅ Provide access URLs and quick commands

### Option 2: Manual Docker Deployment

```bash
git clone https://github.com/LePro10/Minecraft-SSH-System.git
cd Minecraft-SSH-System
docker compose up -d --build
```

Access the dashboard:
- **Local**: `http://localhost`
- **Network**: `http://YOUR_SERVER_IP`

## 📋 System Architecture

### Smart Backend Logic (SSH Weiche)

The backend intelligently decides how to execute commands:

| Connection Type | IP Entered | Execution Method | Use Case |
|----------------|------------|------------------|----------|
| **Local** | `127.0.0.1` or `localhost` | Direct `child_process` | No SSH overhead within same VM |
| **Remote** | Any other IP | SSH2 library | Secure remote server management |

### Dynamic API Detection

The frontend automatically discovers the backend location:

```javascript
// No configuration needed!
const API_URL = `http://${window.location.hostname}:3001`;
```

This enables:
- ✅ Access from `localhost`
- ✅ Access from LAN IP (e.g., `192.168.1.100`)
- ✅ Access from public IP or domain
- ✅ Zero configuration changes required

### Docker Host Networking

Using `network_mode: "host"` provides:
- ✅ Backend can access SSH port (22) on the host
- ✅ Frontend accessible on port 80
- ✅ No complex Docker network bridging
- ✅ Simplified deployment

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **Framer Motion** - Smooth animations and gestures
- **Socket.io Client** - Real-time communication
- **Recharts** - Beautiful, responsive charts
- **React Grid Layout** - Draggable dashboard widgets

### Backend
- **Node.js 18** - Modern JavaScript runtime
- **Express** - Robust web framework
- **Socket.io** - Real-time bidirectional communication
- **SSH2** - Secure Shell protocol for remote connections
- **child_process** - Direct local command execution
- **Multer** - File upload handling

### Infrastructure
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Production-ready web server
- **Host Networking** - Optimized container communication

## 📁 Project Structure

```
mc-ssh-system/
├── src/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── SmartSSHService.js    # Intelligent SSH/Local routing
│   │   │   │   └── LocalFSAdapter.js     # Local filesystem SFTP adapter
│   │   │   ├── controllers/              # API route handlers
│   │   │   └── server.js                 # Express & Socket.io server
│   │   ├── config.json                   # Server configuration
│   │   └── uploads/                      # Plugin icons, etc.
│   └── frontend/
│       ├── src/
│       │   ├── components/               # React components
│       │   ├── context/                  # State management
│       │   ├── config/
│       │   │   └── api.js                # Dynamic API config
│       │   └── App.jsx                   # Main application
│       └── package.json
├── docker-compose.yml                    # Host network deployment
├── backend.Dockerfile                    # Backend container
├── frontend.Dockerfile                   # Frontend container (Nginx)
└── install.sh                           # Universal installer
```

## 🔧 Configuration

### Default Configuration (src/backend/config.json)

```json
{
  "ssh": {
    "host": "127.0.0.1",
    "port": 22,
    "username": "root"
  },
  "minecraft": {
    "path": "/home/mcserver",
    "screenName": "minecraft",
    "startScript": "./start.sh",
    "stopScript": "stop"
  }
}
```

### Connecting to Your Server

1. Open the dashboard in your browser
2. Go to **Settings** tab
3. Enter your SSH credentials:
   - **Host**: `127.0.0.1` for local server, or IP for remote
   - **Port**: Usually `22`
   - **Username**: Your SSH username
   - **Password** or **Private Key**: Authentication method
4. Configure Minecraft server path and screen name
5. Click **Initialize SSH Connection**

The system automatically detects if you're connecting locally or remotely!

## 🐳 Docker Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Rebuild and update
docker compose up -d --build

# View container status
docker compose ps
```

## 🎨 Themes

Choose from 8 stunning themes in **Settings** > **Visual Matrix**:

1. **Liquid Glass** - Default vibrant sapphire
2. **Cherry Blossom** - Soft pink elegance
3. **Matrix Coder** - Green hacker console
4. **Obsidian Black** - High contrast OLED
5. **Gold** - Premium luxury gold
6. **Enchanted Forest** - Deep mystic greens
7. **Deep Nebula** - Cosmic purple void
8. **Crimson Sunset** - Warm gradients

Plus 3 geometry modes: **Sharp**, **Soft**, **Round**

## 🔐 Security Features

- ✅ Secure SSH2 protocol for remote connections
- ✅ Private key authentication support
- ✅ No credentials stored in environment variables
- ✅ Encrypted communication via Socket.io
- ✅ File permission management (chmod)
- ✅ Isolated Docker containers

## 📊 System Requirements

### Minimum
- **CPU**: 1 core
- **RAM**: 512 MB
- **Disk**: 100 MB for dashboard
- **OS**: Ubuntu 20.04+, Debian 10+, CentOS 7+, or any Linux with Docker

### Recommended
- **CPU**: 2+ cores
- **RAM**: 1 GB+
- **Disk**: 1 GB+ for logs and plugins
- **Network**: Stable connection for real-time updates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### v3.0.0 - Zero-Config Release
- ✨ Added Smart SSH Service with local/remote auto-detection
- ✨ Implemented dynamic API URL detection
- ✨ Host network mode for Docker deployment
- ✨ Universal one-line installer script
- ✨ Local filesystem adapter for zero-overhead local operations
- 🎨 Enhanced Liquid Glass 2.0 design system
- 🔧 Improved error handling and toast notifications
- 📊 Draggable dashboard layouts with persistence

### v2.0.0
- 🎨 Complete Liquid Glass 2.0 UI overhaul
- 🔌 Plugin manager with Spigot integration
- 📁 Advanced file manager with drag & drop
- 👥 Enhanced player management
- 📊 Real-time charts and metrics

### v1.0.0
- 🚀 Initial release
- 🔐 SSH-based server connection
- 📟 Console log streaming
- ⚙️ Basic server controls

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Framer Motion** - For beautiful animations
- **SSH2** - For secure remote connections
- **Spigot** - For the plugin ecosystem
- **Docker** - For containerization

---

**Made with ❤️ by LePro10**

*If you find this project useful, please consider giving it a ⭐ on GitHub!*
