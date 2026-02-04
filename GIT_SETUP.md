# 📦 Git Repository Setup

## ✅ Status: Repository ist initialisiert!

Alle Dateien sind committed. Jetzt musst du das Repository auf GitHub/GitLab pushen.

---

## 🚀 Auf GitHub pushen

### 1. Erstelle ein neues Repository auf GitHub

Gehe zu: https://github.com/new

- **Repository name:** `letta-web-platform`
- **Description:** `Multi-Agent AI Platform with 9 specialized agents`
- **Visibility:** Private (empfohlen) oder Public
- ⚠️ **WICHTIG:** NICHT "Initialize with README" anklicken!

### 2. Verbinde mit GitHub

```bash
cd /Users/dsselmanovic/letta-web-platform

# Füge Remote Repository hinzu (ändere USERNAME zu deinem GitHub Username)
git remote add origin https://github.com/USERNAME/letta-web-platform.git

# Push zum Repository
git push -u origin main
```

---

## 🦊 Auf GitLab pushen

### 1. Erstelle ein neues Repository auf GitLab

Gehe zu: https://gitlab.com/projects/new

- **Project name:** `letta-web-platform`
- **Visibility:** Private oder Public
- ⚠️ **WICHTIG:** NICHT "Initialize with README" anklicken!

### 2. Verbinde mit GitLab

```bash
cd /Users/dsselmanovic/letta-web-platform

# Füge Remote Repository hinzu (ändere USERNAME)
git remote add origin https://gitlab.com/USERNAME/letta-web-platform.git

# Push zum Repository
git push -u origin main
```

---

## 📁 Was ist im Repository?

```
letta-web-platform/
├── backend/
│   ├── agents/           # 9 optimierte Agent-Profile (v2.0) ✅
│   ├── src/
│   │   ├── routes/       # API Endpoints
│   │   ├── services/     # Agent Loader & Management
│   │   └── websocket/    # Real-time Communication
│   └── package.json
├── frontend/
│   ├── app/
│   │   └── page.js       # Main Chat UI
│   ├── components/
│   │   ├── AgentSelector.js
│   │   └── ChatInterface.js
│   └── package.json
├── README.md             # Projekt-Dokumentation
├── DEPLOY_INSTRUCTIONS.md # Deployment-Guide für www.letta.activi.io
├── nginx.conf            # Nginx-Konfiguration
└── .gitignore            # Schützt .env und node_modules
```

---

## 🔒 Sicherheit

### ✅ Diese Dateien sind NICHT im Git (durch .gitignore):

- `.env` (API Keys, Secrets)
- `.env.production` (Production Secrets)
- `node_modules/` (Dependencies)
- `.next/` (Build Cache)
- Logs

### ⚠️ WICHTIG vor dem Push:

Prüfe dass keine Secrets committed wurden:

```bash
git log --all --full-history -- **/.env
```

Sollte nichts zeigen!

---

## 🔄 Updates pushen

Nachdem du Änderungen gemacht hast:

```bash
cd /Users/dsselmanovic/letta-web-platform

# Änderungen anschauen
git status

# Alle Änderungen stagen
git add .

# Commit erstellen
git commit -m "Update: Beschreibung deiner Änderungen"

# Zum Repository pushen
git push
```

---

## 👥 Team-Collaboration

Wenn andere Entwickler beitragen sollen:

### Repository klonen:
```bash
git clone https://github.com/USERNAME/letta-web-platform.git
cd letta-web-platform

# Backend setup
cd backend
npm install
cp .env.example .env
# LETTA_API_KEY eintragen!

# Frontend setup
cd ../frontend
npm install

# Starten
../START_LOCAL.sh
```

---

## 🌐 Deployment auf www.letta.activi.io

Nachdem das Repository auf GitHub/GitLab ist:

### Option 1: Direkt vom Repository auf Server deployen

```bash
# Auf deinem VPS Server
ssh root@YOUR_SERVER_IP

cd /var/www
git clone https://github.com/USERNAME/letta-web-platform.git
cd letta-web-platform

# Deployment ausführen
./deploy.sh
```

### Option 2: CI/CD Pipeline (GitHub Actions)

Erstelle `.github/workflows/deploy.yml` für automatisches Deployment bei jedem Push.

---

## 📊 Repository-Statistiken

```
✅ 49 Files
✅ 10,507 Lines of Code
✅ 9 Optimized Agent Profiles
✅ Production-Ready
✅ Documentation Complete
```

---

## 🎯 Nächste Schritte

1. ✅ Repository auf GitHub/GitLab pushen
2. ⏳ Auf Server deployen (www.letta.activi.io)
3. ⏳ Team-Zugriff einrichten (falls gewünscht)
4. ⏳ CI/CD Pipeline setup (optional)

---

**Erstellt mit ❤️ using Letta Code SDK**
