# 🚀 Quick Start - Lokal auf deinem Mac

## In 3 Minuten starten!

---

## 🔑 Schritt 1: Letta API Key eintragen

```bash
# Öffne diese Datei:
nano /Users/dsselmanovic/letta-web-platform/backend/.env

# Ändere diese Zeile:
LETTA_API_KEY=your_letta_api_key_here

# zu:
LETTA_API_KEY=dein_echter_letta_api_key

# Speichern: Ctrl+O, Enter, Ctrl+X
```

---

## 🚀 Schritt 2: Platform starten

### Option A: Automatisch (Empfohlen)

```bash
cd /Users/dsselmanovic/letta-web-platform
./START_LOCAL.sh
```

### Option B: Manuell (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd /Users/dsselmanovic/letta-web-platform/backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/dsselmanovic/letta-web-platform/frontend
npm install
npm run dev
```

---

## 🌐 Schritt 3: Im Browser öffnen

**Frontend:** **http://localhost:3000** ← HIER KLICKEN!

**Backend API:** http://localhost:3001  
**Health Check:** http://localhost:3001/health

---

## 💬 Schritt 4: Testen!

1. Öffne **http://localhost:3000**
2. Du siehst die Chat-Oberfläche
3. "Auto-Select Agent" ist aktiviert
4. Stelle eine Frage:

**Beispiele:**
```
"Analyze this dataset: sales Q4 2025"
→ Wählt Meta Data/ML Agent

"Review my Python code for bugs"
→ Wählt Meta Code Agent

"Create a marketing campaign for product launch"
→ Wählt Meta Marketing Agent

"Help me create a budget for Q1"
→ Wählt Meta Finance Agent
```

Der beste Agent wird automatisch ausgewählt! ✨

---

## 🎯 Was du sehen solltest:

**Sidebar (links):**
- Liste der 9 Agents
- Mit Icons und Beschreibungen

**Chat (rechts):**
- Eingabefeld
- "Auto-Select Agent" Checkbox
- Nachrichten-Bereich

---

## 🔧 Troubleshooting

### "Port 3000 already in use"
```bash
# Finde Prozess
lsof -i :3000

# Oder starte Frontend auf anderem Port
cd frontend
npm run dev -- -p 3005
```

### "Port 3001 already in use"
```bash
# Finde Prozess
lsof -i :3001

# Oder ändere Port in backend/.env
PORT=3005
```

### Backend startet nicht?
```bash
# Prüfe ob alle Agents geladen werden
cd backend
npm run dev

# Sollte zeigen:
# 📦 Loading 9 agent profiles...
# ✅ Loaded 9 agent profiles total
```

### Frontend zeigt Fehler?
```bash
# Dependencies neu installieren
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

---

## 📊 Logs anschauen

Wenn du mit `./START_LOCAL.sh` gestartet hast:

```bash
# Backend Logs
tail -f backend.log

# Frontend Logs  
tail -f frontend.log
```

---

## 🛑 Platform stoppen

**Mit START_LOCAL.sh gestartet?**
```bash
Ctrl+C im Terminal
```

**Manuell gestartet?**
```bash
Ctrl+C in beiden Terminals
```

---

## ✅ Erfolg?

Wenn alles läuft:
- ✅ Frontend auf http://localhost:3000
- ✅ Backend antwortet auf http://localhost:3001/health
- ✅ 9 Agents werden geladen
- ✅ Chat funktioniert

**Dann bist du ready!** 🎉

Später kannst du die Platform auf deinen Server deployen:
→ Siehe `DEPLOY_INSTRUCTIONS.md`

---

## 🚀 Nächste Schritte

1. **Teste alle 9 Agents** - Probiere verschiedene Fragen
2. **Manueller Modus** - Deaktiviere "Auto-Select" und wähle Agents selbst
3. **Code anschauen** - Verstehe wie Smart Selection funktioniert
4. **Anpassen** - Ändere UI, füge Features hinzu
5. **Deployen** - Wenn alles gut ist → auf Server!

**Viel Spaß!** 😊
