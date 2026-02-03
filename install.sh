#!/bin/bash

###############################################################################
# Minecraft SSH System - Universal Zero-Config Installer v3.0
# 
# This script automatically:
# - Checks and installs Docker if needed
# - Handles user permissions intelligently (sudo vs root)
# - Creates project directory structure with correct ownership
# - Sets up proper file permissions for uploads and configs
# - Deploys the complete system
# 
# Usage: bash install.sh  OR  curl -fsSL https://your-repo/install.sh | bash
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
# 1. Intelligent User & Permission Detection
###############################################################################

echo -e "${YELLOW}[1/7]${NC} Detecting user and permissions..."

# Detect the real user (even if script is run with sudo)
if [ -n "$SUDO_USER" ]; then
    REAL_USER="$SUDO_USER"
    REAL_HOME=$(getent passwd "$SUDO_USER" | cut -d: -f6)
    echo -e "${CYAN}🔍 Detected: Running with sudo as user ${REAL_USER}${NC}"
elif [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ This script should NOT be run as root user.${NC}"
    echo -e "${YELLOW}💡 Please run as a regular user:${NC}"
    echo -e "${YELLOW}   bash install.sh${NC}"
    echo -e "${YELLOW}   OR${NC}"
    echo -e "${YELLOW}   curl -fsSL https://your-repo/install.sh | bash${NC}"
    exit 1
else
    REAL_USER="$USER"
    REAL_HOME="$HOME"
    echo -e "${CYAN}🔍 Detected: Running as user ${REAL_USER}${NC}"
fi

echo -e "${GREEN}✅ User: ${REAL_USER}, Home: ${REAL_HOME}${NC}"

# Function to run commands as the real user (not root)
run_as_user() {
    if [ -n "$SUDO_USER" ]; then
        sudo -u "$SUDO_USER" "$@"
    else
        "$@"
    fi
}

###############################################################################
# 2. Install Docker if needed
###############################################################################

echo -e "\n${YELLOW}[2/7]${NC} Checking Docker installation..."

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
    
    echo -e "${GREEN}✅ Docker installed successfully!${NC}"
else
    echo -e "${GREEN}✅ Docker is already installed${NC}"
fi

###############################################################################
# 3. Docker Group & Permissions Setup
###############################################################################

echo -e "\n${YELLOW}[3/7]${NC} Configuring Docker permissions..."

# Check if user is in docker group
if ! groups "$REAL_USER" | grep -q '\bdocker\b'; then
    echo -e "${CYAN}➕ Adding ${REAL_USER} to docker group...${NC}"
    sudo usermod -aG docker "$REAL_USER"
    echo -e "${GREEN}✅ User added to docker group${NC}"
    
    echo -e "\n${YELLOW}⚠️  IMPORTANT: Docker group membership activated!${NC}"
    echo -e "${YELLOW}You have two options to apply the changes:${NC}"
    echo -e "${YELLOW}  1. Run: ${BLUE}newgrp docker${YELLOW} (recommended - immediate effect)${NC}"
    echo -e "${YELLOW}  2. Log out and log back in${NC}\n"
    
    # Try to continue with newgrp for this session
    NEEDS_NEWGRP=true
else
    echo -e "${GREEN}✅ User ${REAL_USER} is already in docker group${NC}"
    NEEDS_NEWGRP=false
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose plugin not found. Please install it manually.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is ready${NC}"

###############################################################################
# 4. Create Project Directory (with correct ownership)
###############################################################################

echo -e "\n${YELLOW}[4/7]${NC} Setting up project directory..."

PROJECT_DIR="${REAL_HOME}/mc-ssh-system"

if [[ -d "$PROJECT_DIR" ]]; then
    echo -e "${YELLOW}⚠️  Directory $PROJECT_DIR already exists.${NC}"
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}🗑️  Removing existing directory...${NC}"
        sudo rm -rf "$PROJECT_DIR"
    else
        echo -e "${YELLOW}⚠️  Using existing directory. Continuing installation...${NC}"
    fi
fi

# Create directory as real user (not root)
echo -e "${CYAN}📁 Creating project directory: $PROJECT_DIR${NC}"
run_as_user mkdir -p "$PROJECT_DIR"

# Ensure correct ownership
sudo chown -R "$REAL_USER:$REAL_USER" "$PROJECT_DIR"

echo -e "${GREEN}✅ Project directory created with correct ownership${NC}"

###############################################################################
# 5. Clone/Download Repository (as real user)
###############################################################################

echo -e "\n${YELLOW}[5/7]${NC} Downloading project files..."

cd "$PROJECT_DIR"

# Check if git is available and clone the repository
if command -v git &> /dev/null; then
    if [[ ! -d ".git" ]]; then
        echo -e "${CYAN}📥 Cloning repository from GitHub...${NC}"
        run_as_user git clone https://github.com/LePro10/Minecraft-SSH-System.git .
        echo -e "${GREEN}✅ Repository cloned successfully${NC}"
    else
        echo -e "${CYAN}🔄 Updating existing repository...${NC}"
        run_as_user git pull
        echo -e "${GREEN}✅ Repository updated${NC}"
    fi
else
    echo -e "${RED}❌ Git not found. Please install git first.${NC}"
    exit 1
fi

# Ensure all files belong to the real user
sudo chown -R "$REAL_USER:$REAL_USER" "$PROJECT_DIR"

###############################################################################
# 6. Set Up Directory Structure & Critical Permissions
###############################################################################

echo -e "\n${YELLOW}[6/7]${NC} Configuring directory structure and permissions..."

# Create necessary directories (as real user)
echo -e "${CYAN}📁 Creating required directories...${NC}"
run_as_user mkdir -p src/backend/uploads
run_as_user mkdir -p src/backend/config
run_as_user mkdir -p src/frontend
run_as_user mkdir -p src/uploads

# Create config.json if it doesn't exist (as real user)
CONFIG_FILE="src/backend/config.json"
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${CYAN}📝 Creating default configuration file...${NC}"
    run_as_user tee "$CONFIG_FILE" > /dev/null << 'JSON'
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

# CRITICAL: Set proper permissions for uploads and config
# This prevents "Permission Denied" errors from the backend
echo -e "${CYAN}🔐 Setting critical permissions for uploads and configs...${NC}"

# Make sure uploads directories are writable by Docker container
sudo chmod -R 777 src/backend/uploads
sudo chmod -R 777 src/uploads

# Make config.json writable
sudo chmod 666 src/backend/config.json

# Ensure user ownership
sudo chown -R "$REAL_USER:$REAL_USER" src/

echo -e "${GREEN}✅ Permissions configured:${NC}"
echo -e "${GREEN}   • Uploads: 777 (read/write/execute for all)${NC}"
echo -e "${GREEN}   • Config: 666 (read/write for all)${NC}"
echo -e "${GREEN}   • Owner: ${REAL_USER}${NC}"

###############################################################################
# 7. Build and Deploy with Docker Compose
###############################################################################

echo -e "\n${YELLOW}[7/7]${NC} Building and deploying containers..."

echo -e "${CYAN}🏗️  Building Docker images (this may take a few minutes)...${NC}"

# Stop and remove existing containers
if $NEEDS_NEWGRP; then
    echo -e "${YELLOW}⚠️  Activating docker group for this session...${NC}"
    # Use sg (newgrp alternative that works in scripts)
    sg docker -c "docker compose down 2>/dev/null || true"
    sg docker -c "docker compose up -d --build"
    BUILD_RESULT=$?
else
    docker compose down 2>/dev/null || true
    docker compose up -d --build
    BUILD_RESULT=$?
fi

# Ensure correct ownership of any files created by Docker
sudo chown -R "$REAL_USER:$REAL_USER" "$PROJECT_DIR"

if [[ $BUILD_RESULT -eq 0 ]]; then
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
    
    if $NEEDS_NEWGRP; then
        echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEP:${NC}"
        echo -e "${YELLOW}To use Docker commands without sudo, please run:${NC}"
        echo -e "${BLUE}   newgrp docker${NC}"
        echo -e "${YELLOW}Or log out and log back in.${NC}"
        echo -e ""
    fi
    
    echo -e "${YELLOW}💡 Usage Tips:${NC}"
    echo -e "   • The system automatically detects local vs remote SSH"
    echo -e "   • For local server: Use IP ${BLUE}127.0.0.1${NC} in dashboard"
    echo -e "   • For remote server: Use the actual ${BLUE}server IP${NC}"
    echo -e "   • All configuration is saved automatically"
    echo -e "   • Uploads and configs have correct permissions (777/666)"
    echo -e ""
    echo -e "${GREEN}🎮 Enjoy your Liquid Glass Dashboard!${NC}\n"
else
    echo -e "\n${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌  Installation Failed                                 ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${YELLOW}Possible issues and solutions:${NC}"
    echo -e "${YELLOW}1. Docker permissions: ${NC}"
    echo -e "   Run: ${BLUE}newgrp docker${NC}"
    echo -e "${YELLOW}2. Check logs: ${NC}"
    echo -e "   Run: ${BLUE}docker compose logs${NC}"
    echo -e "${YELLOW}3. Retry installation: ${NC}"
    echo -e "   Run: ${BLUE}bash install.sh${NC}"
    echo -e ""
    exit 1
fi
