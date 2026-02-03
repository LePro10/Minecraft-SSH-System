#!/bin/bash

###############################################################################
# Minecraft SSH System - Universal Zero-Config Installer
# 
# This script automatically:
# - Checks and installs Docker if needed
# - Creates project directory structure
# - Sets up proper permissions
# - Deploys the complete system
# 
# Usage: curl -fsSL https://your-repo/install.sh | bash
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fancy header
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ███╗   ███╗ ██████╗    ███████╗███████╗██╗  ██╗    ║
║     ████╗ ████║██╔════╝    ██╔════╝██╔════╝██║  ██║    ║
║     ██╔████╔██║██║         ███████╗███████╗███████║    ║
║     ██║╚██╔╝██║██║         ╚════██║╚════██║██╔══██║    ║
║     ██║ ╚═╝ ██║╚██████╗    ███████║███████║██║  ██║    ║
║     ╚═╝     ╚═╝ ╚═════╝    ╚══════╝╚══════╝╚═╝  ╚═╝    ║
║                                                           ║
║          Minecraft Server Management System v3.0          ║
║              Zero-Config Universal Installer              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}🚀 Starting Zero-Config Installation...${NC}\n"

###############################################################################
# 1. Check System Requirements
###############################################################################

echo -e "${YELLOW}[1/6]${NC} Checking system requirements..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}⚠️  This script should NOT be run as root. Please run as a regular user with sudo privileges.${NC}"
   exit 1
fi

# Check for sudo privileges
if ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}👤 This script requires sudo privileges. You may be prompted for your password.${NC}"
    sudo -v
fi

# Keep sudo alive
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

###############################################################################
# 2. Install Docker if needed
###############################################################################

echo -e "${YELLOW}[2/6]${NC} Checking Docker installation..."

if ! command -v docker &> /dev/null; then
    echo -e "${CYAN}📦 Docker not found. Installing Docker...${NC}"
    
    # Detect OS
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
    else
        echo -e "${RED}❌ Cannot detect OS. Please install Docker manually.${NC}"
        exit 1
    fi
    
    case $OS in
        ubuntu|debian)
            echo -e "${CYAN}Installing Docker on Debian/Ubuntu...${NC}"
            sudo apt-get update
            sudo apt-get install -y ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            sudo chmod a+r /etc/apt/keyrings/docker.gpg
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
              $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
              sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
        centos|rhel|fedora)
            echo -e "${CYAN}Installing Docker on CentOS/RHEL/Fedora...${NC}"
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        *)
            echo -e "${RED}❌ Unsupported OS: $OS${NC}"
            echo -e "${YELLOW}Please install Docker manually from https://docs.docker.com/engine/install/${NC}"
            exit 1
            ;;
    esac
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed successfully!${NC}"
    echo -e "${YELLOW}📋 Note: You may need to log out and back in for Docker group changes to take effect.${NC}"
else
    echo -e "${GREEN}✅ Docker is already installed${NC}"
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose plugin not found. Please install it manually.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is ready${NC}"

###############################################################################
# 3. Create Project Directory
###############################################################################

echo -e "\n${YELLOW}[3/6]${NC} Setting up project directory..."

PROJECT_DIR="$HOME/mc-ssh-system"

if [[ -d "$PROJECT_DIR" ]]; then
    echo -e "${YELLOW}⚠️  Directory $PROJECT_DIR already exists.${NC}"
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}🗑️  Removing existing directory...${NC}"
        rm -rf "$PROJECT_DIR"
    else
        echo -e "${RED}❌ Installation cancelled.${NC}"
        exit 1
    fi
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

echo -e "${GREEN}✅ Project directory created: $PROJECT_DIR${NC}"

###############################################################################
# 4. Clone/Download Repository
###############################################################################

echo -e "\n${YELLOW}[4/6]${NC} Downloading project files..."

# Check if git is available and clone the repository
if command -v git &> /dev/null; then
    echo -e "${CYAN}📥 Cloning repository from GitHub...${NC}"
    git clone https://github.com/LePro10/Minecraft-SSH-System.git .
    echo -e "${GREEN}✅ Repository cloned successfully${NC}"
else
    echo -e "${RED}❌ Git not found. Please install git first.${NC}"
    exit 1
fi

###############################################################################
# 5. Set Up Directory Structure and Permissions
###############################################################################

echo -e "\n${YELLOW}[5/6]${NC} Configuring directory structure and permissions..."

# Create necessary directories
mkdir -p src/backend/uploads
mkdir -p src/backend/config
mkdir -p src/frontend
mkdir -p src/uploads

# Create config.json if it doesn't exist
CONFIG_FILE="src/backend/config.json"
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${CYAN}📝 Creating default configuration file...${NC}"
    cat > "$CONFIG_FILE" << 'JSON'
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
JSON
fi

# Set proper permissions for uploads directory
echo -e "${CYAN}🔐 Setting permissions for uploads directory...${NC}"
chmod -R 777 src/backend/uploads 2>/dev/null || sudo chmod -R 777 src/backend/uploads
chmod -R 777 src/uploads 2>/dev/null || sudo chmod -R 777 src/uploads

echo -e "${GREEN}✅ Directory structure configured${NC}"

###############################################################################
# 6. Build and Deploy with Docker Compose
###############################################################################

echo -e "\n${YELLOW}[6/6]${NC} Building and deploying containers..."

echo -e "${CYAN}🏗️  Building Docker images (this may take a few minutes)...${NC}"

# Stop and remove existing containers
docker compose down 2>/dev/null || true

# Build and start with latest changes
docker compose up -d --build

if [[ $? -eq 0 ]]; then
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}║  ✅  INSTALLATION SUCCESSFUL!                           ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}\n"
    
    # Get server IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    echo -e "${CYAN}📋 Access Information:${NC}"
    echo -e "   ${BLUE}Local Access:${NC}     http://localhost"
    echo -e "   ${BLUE}Network Access:${NC}   http://${SERVER_IP}"
    echo -e ""
    echo -e "${CYAN}🔧 Quick Commands:${NC}"
    echo -e "   ${BLUE}View Logs:${NC}        docker compose logs -f"
    echo -e "   ${BLUE}Stop Services:${NC}    docker compose down"
    echo -e "   ${BLUE}Restart:${NC}          docker compose restart"
    echo -e "   ${BLUE}Update:${NC}           docker compose up -d --build"
    echo -e ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo -e "   • The system automatically detects local vs remote SSH connections"
    echo -e "   • For local server: Use IP ${BLUE}127.0.0.1${NC} in the dashboard"
    echo -e "   • For remote server: Use the actual ${BLUE}server IP${NC}"
    echo -e "   • All configuration is saved automatically"
    echo -e ""
    echo -e "${GREEN}🎮 Enjoy your Liquid Glass Dashboard!${NC}\n"
else
    echo -e "\n${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌  Installation Failed                                 ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${YELLOW}Please check the error messages above and try again.${NC}"
    echo -e "${YELLOW}For support, check the logs with: docker compose logs${NC}\n"
    exit 1
fi
