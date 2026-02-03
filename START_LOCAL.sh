#!/bin/bash

echo "🚀 Starting Letta Web Platform (LOCAL)..."
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env nicht gefunden, erstelle sie..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "PORT=3001
NODE_ENV=development
LETTA_API_KEY=your_letta_api_key_here
LETTA_BASE_URL=https://api.letta.com
JWT_SECRET=local_dev_secret
ALLOWED_ORIGINS=http://localhost:3000
WS_PORT=3002" > backend/.env
fi

# Check if frontend/.env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  frontend/.env.local nicht gefunden, erstelle sie..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002" > frontend/.env.local
fi

echo "📦 Installing dependencies..."
echo ""

# Backend dependencies
echo "Backend..."
cd backend
npm install
cd ..

# Frontend dependencies
echo "Frontend..."
cd frontend
npm install
cd ..

echo ""
echo -e "${GREEN}✅ Dependencies installiert!${NC}"
echo ""

# Check for LETTA_API_KEY
if grep -q "your_letta_api_key_here" backend/.env; then
    echo -e "${YELLOW}⚠️  WICHTIG: Füge deinen LETTA_API_KEY ein!${NC}"
    echo ""
    echo "   Öffne: backend/.env"
    echo "   Ändere: LETTA_API_KEY=dein_echter_api_key"
    echo ""
    read -p "Drücke Enter wenn du den API Key eingetragen hast..."
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start Backend
echo "Starting Backend on http://localhost:3001..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "Starting Frontend on http://localhost:3000..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a bit
sleep 3

echo ""
echo -e "${GREEN}✅ Letta Web Platform läuft!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  🌐 Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  ⚙️  Backend:   ${GREEN}http://localhost:3001${NC}"
echo -e "  🔌 WebSocket: ${GREEN}ws://localhost:3002${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Stoppen: Drücke Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Stopped!"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Keep script running
echo "Platform läuft... (Ctrl+C zum Stoppen)"
wait
