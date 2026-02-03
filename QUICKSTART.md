# 🚀 Schnellstart-Anleitung - Minecraft SSH System v3.0

## Ein-Befehl-Installation

```bash
curl -fsSL https://raw.githubusercontent.com/LePro10/Minecraft-SSH-System/main/install.sh | bash
```

**Das war's!** Der Installer macht alles automatisch:
- ✅ Prüft und installiert Docker
- ✅ Erstellt ~/mc-ssh-system Verzeichnis
- ✅ Setzt alle Berechtigungen
- ✅ Baut und startet das System

## Zugriff

Nach erfolgreicher Installation:

### Lokal (auf dem Server selbst)
```
http://localhost
```

### Von einem anderen Gerät im Netzwerk
```
http://DEINE-SERVER-IP
```

Beispiel: `http://192.168.1.100`

## Erste Schritte im Dashboard

1. **Öffne den Browser** und gehe zu `http://localhost` oder deiner Server-IP

2. **Settings-Tab** öffnen (linke Seitenleiste)

3. **SSH-Verbindung einrichten**:

   **Für lokalen Minecraft-Server** (auf derselben Maschine):
   ```
   Host: 127.0.0.1
   Port: 22
   Username: dein-linux-username
   Password: dein-passwort
   ```

   **Für entfernten Minecraft-Server**:
   ```
   Host: IP-des-minecraft-servers
   Port: 22
   Username: ssh-username
   Password: ssh-passwort
   ```

4. **Minecraft-Pfad konfigurieren**:
   ```
   Root Deployment Path: /home/mcserver
   Multiplexer Domain: minecraft
   Initialization Sequence: ./start.sh
   Termination Protocol: stop
   ```

5. **Initialize SSH Connection** klicken

6. **Dashboard nutzen**! 🎉

## Wichtiger Unterschied

### Lokaler Server (127.0.0.1)
- ⚡ **Kein SSH-Overhead** - Befehle werden direkt ausgeführt
- 🔓 Keine SSH-Verschlüsselung innerhalb der VM
- 🚀 Maximale Performance

### Remote Server (andere IPs)
- 🔐 **Vollständige SSH-Verschlüsselung**
- 🌐 Sichere Remote-Verwaltung
- 🛡️ Standard SSH-Sicherheit

**Das System erkennt automatisch, welcher Modus verwendet werden soll!**

## Nützliche Docker-Befehle

```bash
# Logs anzeigen
docker compose logs -f

# Services stoppen
docker compose down

# Services neustarten
docker compose restart

# System aktualisieren
cd ~/mc-ssh-system
git pull
docker compose up -d --build
```

## Problemlösung

### Dashboard nicht erreichbar?

```bash
# Prüfe ob Container laufen
docker compose ps

# Prüfe Logs
docker compose logs

# Neustart
docker compose restart
```

### SSH-Verbindung schlägt fehl?

1. **Prüfe SSH-Zugriff** manuell:
   ```bash
   ssh username@host
   ```

2. **Für lokalen Server**: Nutze `127.0.0.1` als Host

3. **Für Remote**: Stelle sicher, dass:
   - SSH auf Port 22 läuft
   - Firewall Port 22 erlaubt
   - Credentials korrekt sind

### Port bereits belegt?

Falls Port 80 oder 3001 bereits verwendet wird:

```bash
# Services stoppen
docker compose down

# Andere Services, die Port 80 nutzen:
sudo systemctl stop apache2  # falls Apache läuft
sudo systemctl stop nginx    # falls Nginx läuft
```

## Themes & Personalisierung

Wähle aus 8 Premium-Themes:
1. **Liquid Glass** - Sapphire (Default)
2. **Cherry Blossom** - Soft Pink
3. **Matrix Coder** - Hacker Green
4. **Obsidian Black** - High Contrast
5. **Gold** - Luxury Gold
6. **Enchanted Forest** - Mystic Green
7. **Deep Nebula** - Cosmic Purple
8. **Crimson Sunset** - Warm Orange

**Geometry Density**:
- Sharp - Kantige Rechtecke
- Soft - Leicht abgerundet (Default)
- Round - Stark abgerundet

## Features auf einen Blick

### 📊 Dashboard
- Live CPU, RAM, Disk Metriken
- TPS (Ticks per Second) Anzeige
- Echo-Zeit Diagramme
- Start/Stop/Reload Buttons
- Interaktive Konsole

### 📁 Filesystem
- Drag & Drop Dateien
- Visueller Editor für Text-Dateien
- Upload/Download
- Chmod (Berechtigungen ändern)
- Ordner erstellen

### 👥 Players
- Online-Spieler live sehen
- Whitelist verwalten
- OP Status vergeben/entziehen
- Spieler kicken/bannen
- Items geben

### 🔌 Plugins
- Spigot Plugin Store durchsuchen
- Plugins mit einem Klick installieren
- Filter: Alle / Installierte
- Plugin-Details und Spigot-Links

### ⚙️ Server Properties
- Visueller Editor für server.properties
- Kategorie-gruppiert
- Beschreibungen für jede Option
- Speichern mit einem Klick

## Support & Dokumentation

- **Vollständige Dokumentation**: `README.md`
- **Technische Details**: `IMPLEMENTATION.md`
- **GitHub**: https://github.com/LePro10/Minecraft-SSH-System

## Sicherheitshinweise

- ✅ Nutze starke Passwörter für SSH
- ✅ Erwäge SSH-Keys statt Passwörter
- ✅ Aktiviere Firewall (nur Ports 22, 80, 3001, 25565)
- ✅ Halte das System aktualisiert (`git pull && docker compose up -d --build`)

---

**Viel Spaß mit deinem Liquid Glass Dashboard!** 🎮✨
