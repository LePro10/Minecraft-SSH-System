#!/bin/bash
# MC-Dashboard One-Line Installer

echo "🚀 Starte automatische Installation von Minecraft SSH System..."

# 1. Docker Installation prüfen
if ! [ -x "$(command -v docker)" ]; then
    echo "📦 Installiere Docker..."
    curl -fsSL https://get.docker.com | sh
    # Hinweis: usermod wirkt erst nach neuem Login, daher nutzen wir sudo für den ersten Start
    sudo usermod -aG docker $USER
fi

# 2. Projekt-Ordner erstellen und Repo klonen
echo "📂 Lade Projektdaten von GitHub..."
# Verzeichnis säubern, falls es bereits existiert, um Konflikte beim Klonen zu vermeiden
mkdir -p ~/mc-ssh-system && cd ~/mc-ssh-system

if [ -d ".git" ]; then
    echo "🔄 Aktualisiere bestehendes Repository..."
    git pull
else
    git clone https://github.com/LePro10/Minecraft-SSH-System.git .
fi

# 3. WICHTIG: Dateien für Volumes vorbereiten
# Docker kann eine fehlende .json Datei nicht automatisch erstellen (er erstellt sonst einen Ordner)
mkdir -p src/backend
if [ ! -f "src/backend/config.json" ]; then
    echo "{}" > src/backend/config.json
fi
mkdir -p src/uploads

# 4. Docker Compose starten
echo "🏗️ Starte Container (Liquid Glass Dashboard)..."
# Wir nutzen --build, um sicherzustellen, dass die lokalen Dockerfiles korrekt gebaut werden
sudo docker compose up -d --build

echo ""
echo "✅ Installation erfolgreich abgeschlossen!"
# Port 5173 ist der Standard-Port laut deiner docker-compose.yml 
echo "👉 Dein Dashboard ist jetzt erreichbar unter: http://$(hostname -I | cut -d' ' -f1):5173"
echo "👉 Login mit deinen SSH-Daten im Web-Interface."
