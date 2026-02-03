# 🚀 Quick Start - Letta Web Platform

## In 5 Minuten starten!

### 1. Backend starten (Terminal 1)

```bash
cd /Users/dsselmanovic/letta-web-platform/backend

# Dependencies installieren
npm install

# WICHTIG: Letta API Key eintragen!
# Öffne .env und füge deinen API Key ein:
# LETTA_API_KEY=dein_api_key_hier

# Backend starten
npm run dev
```

✅ Backend läuft auf **http://localhost:3001**  
✅ WebSocket läuft auf **ws://localhost:3002**  
✅ **9 Agents** werden automatisch geladen!

---

### 2. Frontend starten (Terminal 2)

```bash
cd /Users/dsselmanovic/letta-web-platform/frontend

# Dependencies installieren
npm install

# Frontend starten
npm run dev
```

✅ Frontend läuft auf **http://localhost:3000**

---

### 3. Öffne im Browser

**http://localhost:3000**

---

## 💬 Sofort loslegen!

### Auto-Select Mode (Aktiviert by default)

Stelle einfach eine Frage - der beste Agent wird automatisch gewählt:

**Beispiele:**
```
"Analyze this sales data and show trends"
→ Wählt Meta Data/ML

"Review my Python code for bugs"
→ Wählt Meta Code

"Create a marketing campaign for product X"
→ Wählt Meta Marketing

"Help me create a budget for Q1"
→ Wählt Meta Finance

"Automate the invoice sending process"
→ Wählt Meta Automation
```

---

## 🎯 Die 9 Agents

1. **Meta Data/ML** - Data Science, ML Models, Analytics
2. **Meta Code** - Code Review, Refactoring, Tests
3. **Meta Finance** - Budgets, Reporting, Forecasting
4. **Meta Marketing** - Content, SEO, Campaigns
5. **Meta Automation** - Workflows, APIs, Bots
6. **Meta Business** - Strategy, OKRs, Growth
7. **Meta Berater** - Consulting, Decisions, Analysis
8. **Meta Onboarding** - Training, Documentation
9. **Meta Repo** - Git, CI/CD, Code Review

---

## 🔧 Troubleshooting

### Backend startet nicht?
```bash
# Prüfe ob Port 3001 frei ist
lsof -i :3001

# Oder ändere Port in backend/.env
PORT=3005
```

### Frontend startet nicht?
```bash
# Prüfe ob Port 3000 frei ist
lsof -i :3000

# Oder starte auf anderem Port
npm run dev -- -p 3005
```

### Agents werden nicht geladen?
```bash
# Prüfe ob Agent-Profile existieren
ls backend/agents/

# Sollte 9 Dateien zeigen:
# agent_meta-*_OPTIMIZED.json
```

---

## 📊 Health Check

**Backend:** http://localhost:3001/health

```json
{
  "status": "OK",
  "timestamp": "2026-02-03T...",
  "agentProfiles": 9,
  "activeAgents": 0
}
```

**Agent Profiles:** http://localhost:3001/api/agent-profiles/profiles

---

## 🎉 Fertig!

Du bist ready! Die Letta Web Platform läuft jetzt lokal.

**Viel Spaß mit deinen 9 AI Agents!** 🤖
