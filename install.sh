#!/bin/bash
# MC-Dashboard One-Line Installer

echo "🚀 Starte automatische Installation von Minecraft SSH System..."

# 1. Docker Installation prüfen
if ! [ -x "$(command -v docker)" ]; then
    echo "📦 Installiere Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# 2. Projekt-Ordner erstellen und Repo klonen
echo "📂 Lade Projektdaten von GitHub..."
mkdir -p ~/mc-ssh-system && cd ~/mc-ssh-system
# Wir klonen das Repo direkt in den Ordner
git clone https://github.com/LePro10/Minecraft-SSH-System.git .

# 3. Docker Compose starten
echo "🏗️ Starte Container (Liquid Glass Dashboard)..."
docker compose up -d

echo ""
echo "✅ Installation erfolgreich abgeschlossen!"
echo "👉 Dein Dashboard ist jetzt erreichbar unter: http://$(hostname -I | cut -d' ' -f1):5173"
echo "👉 Login mit deinen SSH-Daten im Web-Interface."
