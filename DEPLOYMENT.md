# 🚀 Deployment Guide - letta.activi.io

## Production Deployment auf eigenem VPS Server

---

## 📋 Voraussetzungen

- ✅ VPS Server (Ubuntu 20.04+ oder Debian 11+)
- ✅ Root/Sudo Zugriff
- ✅ Domain DNS konfiguriert: `www.letta.activi.io` → Server IP
- ✅ Ports offen: 80 (HTTP), 443 (HTTPS)
- ✅ Letta API Key von https://api.letta.com

---

## 🎯 Quick Deploy (Automatisch)

### 1. Dateien auf Server hochladen

```bash
# Auf deinem Mac
cd /Users/dsselmanovic/letta-web-platform
tar -czf letta-platform.tar.gz .
scp letta-platform.tar.gz root@YOUR_SERVER_IP:/tmp/

# Auf dem Server
ssh root@YOUR_SERVER_IP
cd /var/www
mkdir -p letta-web-platform
cd letta-web-platform
tar -xzf /tmp/letta-platform.tar.gz
```

### 2. Letta API Key eintragen

```bash
cd /var/www/letta-web-platform/backend
nano .env.production

# Ändere diese Zeile:
LETTA_API_KEY=dein_echter_letta_api_key_hier
```

### 3. Deployment ausführen

```bash
cd /var/www/letta-web-platform
chmod +x deploy.sh
sudo ./deploy.sh
```

Das wars! Die Platform ist jetzt live auf **https://www.letta.activi.io** 🎉

---

## 🔧 Manuelles Deployment

Falls du mehr Kontrolle willst:

### 1. System Dependencies

```bash
sudo apt-get update
sudo apt-get install -y nodejs npm nginx certbot python3-certbot-nginx git
```

### 2. Backend Setup

```bash
cd /var/www/letta-web-platform/backend
npm install --production

# Environment konfigurieren
cp .env.production .env
nano .env  # LETTA_API_KEY eintragen
```

### 3. Frontend Setup

```bash
cd /var/www/letta-web-platform/frontend
npm install
npm run build
```

### 4. Nginx Konfiguration

```bash
sudo cp nginx.conf /etc/nginx/sites-available/letta.activi.io
sudo ln -s /etc/nginx/sites-available/letta.activi.io /etc/nginx/sites-enabled/
sudo nginx -t
```

### 5. SSL Certificate (Let's Encrypt)

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone \
    -d www.letta.activi.io \
    -d letta.activi.io
sudo systemctl start nginx
```

### 6. Systemd Services

**Backend Service:**
```bash
sudo nano /etc/systemd/system/letta-backend.service
```

```ini
[Unit]
Description=Letta Web Platform Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/letta-web-platform/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Frontend Service:**
```bash
sudo nano /etc/systemd/system/letta-frontend.service
```

```ini
[Unit]
Description=Letta Web Platform Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/letta-web-platform/frontend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Services aktivieren und starten:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable letta-backend letta-frontend nginx
sudo systemctl start letta-backend letta-frontend nginx
```

---

## ✅ Deployment Überprüfen

### Service Status

```bash
sudo systemctl status letta-backend
sudo systemctl status letta-frontend
sudo systemctl status nginx
```

### Health Check

```bash
curl https://www.letta.activi.io/health
```

Erwartete Antwort:
```json
{
  "status": "OK",
  "timestamp": "...",
  "agentProfiles": 9,
  "activeAgents": 0
}
```

### Logs anschauen

```bash
# Backend Logs
sudo journalctl -u letta-backend -f

# Frontend Logs
sudo journalctl -u letta-frontend -f

# Nginx Logs
sudo tail -f /var/log/nginx/letta-activi-error.log
```

---

## 🔄 Updates deployen

```bash
# Auf dem Server
cd /var/www/letta-web-platform

# Git pull (falls Git repo)
git pull

# Oder neue Dateien hochladen und extrahieren

# Backend neu starten
cd backend
npm install --production
sudo systemctl restart letta-backend

# Frontend neu bauen
cd ../frontend
npm install
npm run build
sudo systemctl restart letta-frontend
```

---

## 🔒 Sicherheit

### Firewall konfigurieren

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### SSL Auto-Renewal

```bash
# Certbot erneuert automatisch, teste es:
sudo certbot renew --dry-run

# Cron job sollte existieren:
sudo systemctl status certbot.timer
```

### Secrets schützen

```bash
# .env Dateien nicht in Git
sudo chmod 600 /var/www/letta-web-platform/backend/.env

# JWT Secret ändern
sudo nano /var/www/letta-web-platform/backend/.env
# Ändere JWT_SECRET zu einem zufälligen String
```

---

## 📊 Monitoring

### PM2 (Alternative zu Systemd)

```bash
sudo npm install -g pm2

# Backend starten
cd /var/www/letta-web-platform/backend
pm2 start src/index.js --name letta-backend

# Frontend starten
cd /var/www/letta-web-platform/frontend
pm2 start npm --name letta-frontend -- start

# Auto-start on reboot
pm2 startup
pm2 save
```

### Monitoring Dashboard

```bash
pm2 monit
```

---

## 🚨 Troubleshooting

### Backend startet nicht

```bash
# Logs checken
sudo journalctl -u letta-backend -n 50

# Manuell testen
cd /var/www/letta-web-platform/backend
NODE_ENV=production node src/index.js
```

### Frontend startet nicht

```bash
# Build errors?
cd /var/www/letta-web-platform/frontend
npm run build

# Port schon belegt?
sudo lsof -i :3000
```

### Nginx Fehler

```bash
# Config testen
sudo nginx -t

# Logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Fehler

```bash
# Zertifikat erneuern
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## 🎉 Nach dem Deployment

Deine Platform ist jetzt live auf:

**https://www.letta.activi.io**

Features:
- ✅ 9 spezialisierte AI Agents
- ✅ Smart Auto-Selection
- ✅ Real-time Chat
- ✅ SSL gesichert
- ✅ Production-ready

**Viel Erfolg!** 🚀
