# Minecraft SSH System (SMM)

A premium, high-performance Minecraft server management dashboard that connects to your server via SSH. Built with a "Liquid Glass 2.0" aesthetic, it provides a seamless, modern interface for managing your Minecraft instances remotely.

## ✨ Features

- **SSH-Based Management**: No need to install heavy agents on your game server. Connect via secure SSH.
- **Liquid Glass 2.0 UI**: Stunning, modern dashboard with material fluidity and dynamic lighting.
- **Real-time Console**: Interactive terminal with log streaming and command execution.
- **File Manager**: Full-featured remote file system access (upload, download, edit, chmod).
- **Player Management**: Monitor online players, manage whitelist, OP status, and bans.
- **Plugin Store**: Browse and install plugins directly from Spigot/Cloud sources.
- **System Metrics**: Real-time monitoring of CPU, RAM, and Disk usage on the remote host.
- **Multi-Theme Support**: Choose from various premium themes (Sakura, Obsidian, Glass, etc.).

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **SSH Access**: A remote Minecraft server with SSH enabled.
- **Linux Tools**: `screen` installed on the remote host (recommended for session persistence).

### Manual Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LePro10/Minecraft-SSH-System.git
   cd Minecraft-SSH-System
   ```

2. **Install Dependencies**:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. **Configure Environment**:
   Create a `.env` file in `src/backend` and `src/frontend` if you need custom ports or API URLs.

4. **Start the Application**:
   - **Windows**: Run `src/start.bat`
   - **Linux**: 
     ```bash
     npm start # Starts both frontend and backend
     ```

### Docker Deployment

To run the entire stack using Docker:

```bash
docker-compose up -d
```

Access the dashboard at `http://localhost:5173`.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Socket.io, SSH2.
- **Design System**: Liquid Glass 2.0 Architecture.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
