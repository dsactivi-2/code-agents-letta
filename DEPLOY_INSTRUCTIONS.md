# 🚀 Deployment auf www.letta.activi.io

## Schnell-Anleitung für deinen VPS Server

---

## 📦 1. Dateien auf Server hochladen

```bash
# Auf deinem Mac (lokal)
cd /Users/dsselmanovic
tar -czf letta-platform.tar.gz letta-web-platform/
scp letta-platform.tar.gz root@YOUR_SERVER_IP:/tmp/
```

---

## 🖥️ 2. Auf Server einloggen

```bash
ssh root@YOUR_SERVER_IP
```

---

## 📁 3. Dateien extrahieren

```bash
cd /var/www
tar -xzf /tmp/letta-platform.tar.gz
cd letta-web-platform
```

---

## 🔑 4. Letta API Key eintragen

```bash
cd backend
nano .env.production

# Ändere diese Zeile:
LETTA_API_KEY=dein_echter_api_key_hier

# Speichern: Ctrl+O, Enter, Ctrl+X
```

---

## ⚙️ 5. System vorbereiten

```bash
# Node.js & Nginx installieren
apt-get update
apt-get install -y nodejs npm nginx certbot python3-certbot-nginx

# Backend Dependencies
cd /var/www/letta-web-platform/backend
npm install --production
cp .env.production .env

# Frontend bauen
cd /var/www/letta-web-platform/frontend
npm install
npm run build
```

---

## 🌐 6. Nginx konfigurieren

Erstelle `/etc/nginx/sites-available/letta.activi.io`:

```nginx
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name www.letta.activi.io letta.activi.io;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 300s;
    }
}
```

```bash
# Aktivieren
ln -s /etc/nginx/sites-available/letta.activi.io /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 🔒 7. SSL Certificate (Let's Encrypt)

```bash
certbot --nginx -d www.letta.activi.io -d letta.activi.io
```

---

## 🚀 8. Services starten

**Backend Service** (`/etc/systemd/system/letta-backend.service`):
```ini
[Unit]
Description=Letta Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/letta-web-platform/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

**Frontend Service** (`/etc/systemd/system/letta-frontend.service`):
```ini
[Unit]
Description=Letta Frontend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/letta-web-platform/frontend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Services aktivieren
systemctl daemon-reload
systemctl enable letta-backend letta-frontend
systemctl start letta-backend letta-frontend

# Status checken
systemctl status letta-backend
systemctl status letta-frontend
```

---

## ✅ 9. Testen

```bash
# Health Check
curl https://www.letta.activi.io/health

# Im Browser öffnen:
# https://www.letta.activi.io
```

---

## 🎯 FERTIG!

Deine Letta Web Platform läuft jetzt auf:
**https://www.letta.activi.io** 🚀

- ✅ 9 AI Agents
- ✅ Smart Auto-Selection  
- ✅ SSL gesichert
- ✅ Production-ready

---

## 🔧 Troubleshooting

**Logs anschauen:**
```bash
journalctl -u letta-backend -f
journalctl -u letta-frontend -f
tail -f /var/log/nginx/error.log
```

**Services neustarten:**
```bash
systemctl restart letta-backend
systemctl restart letta-frontend
systemctl restart nginx
```
