# Benutzerrechte & Permissions - Technische Dokumentation

## Problem-Analyse und Lösungen

Diese Dokumentation erklärt alle User-Permission-Probleme und wie der Installer sie löst.

## 🔴 Problem 1: Docker Socket Permission Denied

### Symptom
```bash
ERROR: permission denied while trying to connect to the Docker daemon socket
```

### Ursache
- User `serverusr` ist nicht in der Gruppe `docker`
- Nur root oder Mitglieder der docker-Gruppe dürfen Docker-Befehle ausführen
- Installation bricht bei Schritt [6/7] ab

### ✅ Lösung im Installer

```bash
# Intelligente Gruppen-Prüfung
if ! groups "$REAL_USER" | grep -q '\bdocker\b'; then
    sudo usermod -aG docker "$REAL_USER"
    NEEDS_NEWGRP=true
fi

# Docker-Befehle mit aktivierter Gruppe ausführen
if $NEEDS_NEWGRP; then
    sg docker -c "docker compose up -d --build"
fi
```

**Vorteile:**
- ✅ User wird automatisch zur docker-Gruppe hinzugefügt
- ✅ `sg docker` aktiviert die Gruppe sofort (kein Logout nötig)
- ✅ Klare Benachrichtigung für den User über `newgrp docker`

## 🔴 Problem 2: Root vs. Sudo-User

### Symptom
```bash
⚠️  This script should NOT be run as root
```

### Ursache
- Ursprüngliches Skript blockiert bei `sudo bash install.sh`
- Dateien werden als root erstellt → User kann nicht darauf zugreifen
- Verwirrend für Anfänger

### ✅ Lösung im Installer

```bash
# Intelligente User-Erkennung
if [ -n "$SUDO_USER" ]; then
    # Skript wurde mit sudo gestartet
    REAL_USER="$SUDO_USER"
    REAL_HOME=$(getent passwd "$SUDO_USER" | cut -d: -f6)
elif [ "$EUID" -eq 0 ]; then
    # Direkt als root eingeloggt → Blockieren
    echo "❌ Run as regular user, not root"
    exit 1
else
    # Normal gestartet
    REAL_USER="$USER"
    REAL_HOME="$HOME"
fi

# Helper-Funktion für User-Befehle
run_as_user() {
    if [ -n "$SUDO_USER" ]; then
        sudo -u "$SUDO_USER" "$@"
    else
        "$@"
    fi
}
```

**Vorteile:**
- ✅ Funktioniert mit `bash install.sh` UND `sudo bash install.sh`
- ✅ Alle Dateien gehören dem echten User (nicht root)
- ✅ Nutzt `$REAL_HOME` statt `$HOME` (wichtig bei sudo)

## 🔴 Problem 3: Ordner-Ownership (Docker erstellt als Root)

### Symptom
```bash
ls -la src/backend/uploads
drwxr-xr-x root root  # ❌ Backend kann nicht schreiben!
```

### Ursache
- Docker-Volume-Mapping erstellt fehlende Ordner als root
- Backend-Container läuft als User `node`, kann nicht auf root-Dateien zugreifen
- Upload-Funktion schlägt fehl

### ✅ Lösung im Installer

```bash
# 1. Ordner VOR Docker-Start erstellen (als User)
run_as_user mkdir -p src/backend/uploads
run_as_user mkdir -p src/uploads

# 2. Config-Datei als User erstellen
run_as_user tee src/backend/config.json > /dev/null << 'JSON'
{ ... }
JSON

# 3. Explizite Permissions setzen
sudo chmod -R 777 src/backend/uploads  # Volle Rechte für Container
sudo chmod -R 777 src/uploads
sudo chmod 666 src/backend/config.json  # Read/Write für alle

# 4. Ownership sicherstellen
sudo chown -R "$REAL_USER:$REAL_USER" src/

# 5. Nach Docker-Build nochmal prüfen
sudo chown -R "$REAL_USER:$REAL_USER" "$PROJECT_DIR"
```

**Warum 777/666?**
- `777` (rwxrwxrwx): Docker-Container kann lesen, schreiben, ausführen
- `666` (rw-rw-rw-): Alle können lesen/schreiben (keine Ausführung nötig)
- Kritisch für `uploads/` und `config.json`

## 🔴 Problem 4: Backend Local-Mode Permissions

### Symptom (Theorie)
```bash
# Backend versucht lokalen Befehl auszuführen
spawn('bash', ['-c', 'screen -r minecraft'])
# → Permission denied, da Container-User != Host-User
```

### Ursache
- Backend läuft als User `node` im Container
- Host-Befehle brauchen Host-User-Rechte
- `network_mode: host` allein reicht nicht

### ✅ Lösung (Multi-Layer)

#### Layer 1: Host Networking
```yaml
# docker-compose.yml
services:
  backend:
    network_mode: "host"
    # Ermöglicht direkten Zugriff auf Host-Ports
```

#### Layer 2: SmartSSHService Logic
```javascript
// Backend erkennt Lokal-Modus
if (this.isLocal) {
    // Nutzt child_process, nicht SSH
    const process = spawn('bash', ['-c', command]);
}
```

#### Layer 3: Installer-Permissions
```bash
# Installer gibt allen nötigen Ordnern 777
# → Container kann auf Host-Dateien zugreifen
chmod -R 777 src/backend/uploads
```

**Best Practice für Produktion:**
- Für Dev: 777 ist OK (Einfachheit)
- Für Production: Nutze Docker User-Mapping:
  ```yaml
  backend:
    user: "${UID}:${GID}"
  ```

## 📊 Permission Matrix

| Datei/Ordner | Permissions | Owner | Zweck |
|-------------|-------------|-------|-------|
| `~/mc-ssh-system/` | 755 | $REAL_USER | Projekt-Root |
| `src/backend/config.json` | 666 | $REAL_USER | Backend kann schreiben |
| `src/backend/uploads/` | 777 | $REAL_USER | Plugin-Icons hochladen |
| `src/uploads/` | 777 | $REAL_USER | Allgemeine Uploads |
| `.git/` | 755 | $REAL_USER | Git-Repository |

## 🔧 Installer-Workflow (Schritt für Schritt)

### Schritt 1: User-Erkennung
```bash
[1/7] Detecting user and permissions...
🔍 Detected: Running with sudo as user serverusr
✅ User: serverusr, Home: /home/serverusr
```

### Schritt 2: Docker Installation
```bash
[2/7] Checking Docker installation...
✅ Docker is already installed
```

### Schritt 3: Docker-Gruppe
```bash
[3/7] Configuring Docker permissions...
➕ Adding serverusr to docker group...
✅ User added to docker group

⚠️  IMPORTANT: Docker group membership activated!
You have two options to apply the changes:
  1. Run: newgrp docker (recommended - immediate effect)
  2. Log out and log back in
```

### Schritt 4: Projekt-Ordner
```bash
[4/7] Setting up project directory...
📁 Creating project directory: /home/serverusr/mc-ssh-system
✅ Project directory created with correct ownership
```

### Schritt 5: Git Clone
```bash
[5/7] Downloading project files...
📥 Cloning repository from GitHub...
✅ Repository cloned successfully
# Ownership wird auf serverusr:serverusr gesetzt
```

### Schritt 6: Permissions
```bash
[6/7] Configuring directory structure and permissions...
📁 Creating required directories...
📝 Creating default configuration file...
🔐 Setting critical permissions for uploads and configs...
✅ Permissions configured:
   • Uploads: 777 (read/write/execute for all)
   • Config: 666 (read/write for all)
   • Owner: serverusr
```

### Schritt 7: Docker Build
```bash
[7/7] Building and deploying containers...
⚠️  Activating docker group for this session...
🏗️  Building Docker images...
# Nutzt: sg docker -c "docker compose up -d --build"
✅ INSTALLATION SUCCESSFUL!
```

## 🚨 Häufige Fehler & Fixes

### Fehler: "Permission denied" beim Docker-Build

**Diagnose:**
```bash
groups  # Prüfen ob 'docker' in der Liste ist
```

**Fix:**
```bash
# Option 1: Sofort
newgrp docker
cd ~/mc-ssh-system
docker compose up -d --build

# Option 2: Permanent
# Logout + Login
```

### Fehler: Backend kann config.json nicht schreiben

**Diagnose:**
```bash
ls -la src/backend/config.json
# Sollte sein: -rw-rw-rw- serverusr serverusr
```

**Fix:**
```bash
chmod 666 src/backend/config.json
chown serverusr:serverusr src/backend/config.json
```

### Fehler: Uploads schlagen fehl

**Diagnose:**
```bash
ls -lad src/backend/uploads src/uploads
# Sollte sein: drwxrwxrwx serverusr serverusr
```

**Fix:**
```bash
chmod -R 777 src/backend/uploads src/uploads
chown -R serverusr:serverusr src/backend/uploads src/uploads
```

## 🎯 Best Practices

### Für Entwicklung (Lokal)
```bash
# Einfach, aber unsicher
chmod 777 src/uploads
```

### Für Produktion (Server)
```yaml
# docker-compose.yml
services:
  backend:
    user: "1000:1000"  # Nutze Host-UID
    volumes:
      - ./src/backend/uploads:/app/uploads:rw
```

```bash
# Restriktivere Permissions
chmod 750 src/uploads
chown -R www-data:www-data src/uploads
```

## 📝 Zusammenfassung

Der optimierte Installer löst alle Permission-Probleme durch:

1. ✅ **Intelligente User-Erkennung** (sudo vs normal)
2. ✅ **Automatische Docker-Gruppe** (usermod + sg)
3. ✅ **Korrekte Ownership** (chown auf $REAL_USER)
4. ✅ **Explizite Permissions** (777/666 vor Docker-Start)
5. ✅ **Klare User-Kommunikation** (newgrp-Hinweis)

**Ergebnis:** Zero-Config für den User, keine Permission-Fehler mehr! 🎉
