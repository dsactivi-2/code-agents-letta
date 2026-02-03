#!/bin/bash

# Deployment Script für letta.activi.io
# Führe dieses Script auf deinem VPS Server aus

set -e  # Exit on error

echo "🚀 Deploying Letta Web Platform to letta.activi.io..."
echo ""

# Configuration
DOMAIN="www.letta.activi.io"
APP_DIR="/var/www/letta-web-platform"
BACKEND_PORT=3001
FRONTEND_PORT=3000
WS_PORT=3002

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen (sudo ./deploy.sh)${NC}"
    exit 1
fi

echo "📦 Step 1: System Dependencies..."
apt-get update
apt-get install -y nodejs npm nginx certbot python3-certbot-nginx git

echo "📁 Step 2: Setup Application Directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# If not already cloned, copy files
if [ ! -d "$APP_DIR/backend" ]; then
    echo "Copying application files..."
    # Assuming files are in current directory
    cp -r /Users/dsselmanovic/letta-web-platform/* $APP_DIR/
fi

echo "🔧 Step 3: Backend Setup..."
cd $APP_DIR/backend
npm install --production

# Copy production env if exists
if [ -f ".env.production" ]; then
    cp .env.production .env
else
    echo -e "${YELLOW}⚠️  Warnung: .env.production nicht gefunden. Bitte .env manuell konfigurieren!${NC}"
fi

echo "🎨 Step 4: Frontend Setup..."
cd $APP_DIR/frontend
npm install
npm run build

echo "🌐 Step 5: Nginx Configuration..."
# Copy nginx config
cp $APP_DIR/nginx.conf /etc/nginx/sites-available/letta.activi.io

# Create symlink if not exists
if [ ! -L "/etc/nginx/sites-enabled/letta.activi.io" ]; then
    ln -s /etc/nginx/sites-available/letta.activi.io /etc/nginx/sites-enabled/
fi

# Test nginx config
nginx -t

echo "🔒 Step 6: SSL Certificate (Let's Encrypt)..."
# Stop nginx temporarily for certbot
systemctl stop nginx

# Obtain certificate
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@activi.io \
    -d $DOMAIN \
    -d letta.activi.io

# Start nginx
systemctl start nginx

echo "⚙️  Step 7: Systemd Services..."

# Backend Service
cat > /etc/systemd/system/letta-backend.service << EOF
[Unit]
Description=Letta Web Platform Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend Service
cat > /etc/systemd/system/letta-frontend.service << EOF
[Unit]
Description=Letta Web Platform Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR/frontend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Enable services
systemctl enable letta-backend
systemctl enable letta-frontend
systemctl enable nginx

# Start services
systemctl restart letta-backend
systemctl restart letta-frontend
systemctl restart nginx

echo ""
echo -e "${GREEN}✅ Deployment erfolgreich!${NC}"
echo ""
echo "📍 URLs:"
echo "   Frontend: https://$DOMAIN"
echo "   Backend API: https://$DOMAIN/api"
echo "   Health Check: https://$DOMAIN/health"
echo ""
echo "🔍 Service Status:"
systemctl status letta-backend --no-pager | head -3
systemctl status letta-frontend --no-pager | head -3
systemctl status nginx --no-pager | head -3
echo ""
echo "📝 Logs:"
echo "   Backend:  journalctl -u letta-backend -f"
echo "   Frontend: journalctl -u letta-frontend -f"
echo "   Nginx:    tail -f /var/log/nginx/letta-activi-error.log"
echo ""
echo -e "${YELLOW}⚠️  WICHTIG: Vergiss nicht die .env Datei mit dem echten LETTA_API_KEY zu konfigurieren!${NC}"
echo "   Datei: $APP_DIR/backend/.env"
echo ""
