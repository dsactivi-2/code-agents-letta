# Activi Project Template

> Optimiertes Starter-Kit für produktionsreife AI-Projekte.

**Erstellt:** 2026-01-18
**Version:** 1.0.0

## Quick Start

1. Repo als Template verwenden (GitHub: "Use this template")
2. `TEMPLATE_SETUP.md` befolgen
3. `PROJECT_STATE.md` ausfüllen
4. `MASTER_RUNBOOK.md` Step für Step abarbeiten

## Struktur

```
/
├── README.md                    # Diese Datei
├── MASTER_RUNBOOK.md           # Step-by-Step Entwicklungs-Runbook
├── PROJECT_STATE.md            # Single Source of Truth
├── capabilities.yml            # Capability-Definitionen mit Test-Regeln
├── PRODUCTION_CHECKLIST.md     # Pflicht vor Go-Live
│
├── CONTRACTS/
│   ├── api_contract.md         # API Endpoints (Pflicht)
│   └── data_contract.md        # DB Schema (Pflicht)
│
├── docs/
│   ├── PROJECT_BRIEF.md        # Projekt-Übersicht
│   ├── ARCHITECTURE.md         # System-Architektur
│   ├── TEST_PLAN.md            # Testplan (verweist auf capabilities.yml)
│   └── CONTRACT_VERIFICATION.md # FE ↔ BE ↔ DB Prüfung (Step 7.5)
│
├── ops/
│   ├── POLICY.md               # Projekt-Policies
│   ├── DECISIONS.md            # Architektur-Entscheidungen
│   ├── RISKS.md                # Identifizierte Risiken
│   ├── OPEN_QUESTIONS.md       # Offene Fragen
│   └── RUNBOOK_SUPERVISOR.md   # Supervisor-Checkliste
│
├── agents/                     # AI Agent Definitionen
│   └── {agent_name}/
│       ├── flow.yaml
│       └── playbook.md
│
├── eval/
│   ├── scorecard.yaml          # Bewertungskriterien
│   └── regression_tests.yaml   # Regression Tests
│
├── schemas/
│   └── *.json                  # JSON Schemas für Outputs
│
├── scripts/
│   └── ci/                     # CI/CD Scripts
│
├── integrations/               # Externe Integrationen
│   └── README.md               # Verweis auf zentrale Registry
│
├── templates/
│   └── TASK_TICKET.md          # Task-Vorlage
│
└── .github/
    ├── workflows/
    │   ├── ci.yml
    │   └── quality-gate.yml
    ├── pull_request_template.md
    └── ISSUE_TEMPLATE/
```

## Kernkonzepte

### 1. Contracts-First
API und DB werden ZUERST definiert. Keine Änderung ohne explizite Genehmigung.

### 2. Capabilities mit Test-Pflichten
Jede Funktion wird in `capabilities.yml` registriert mit zugehörigen Test-Anforderungen.

### 3. Production-Pflichten
Vor Go-Live MUSS `PRODUCTION_CHECKLIST.md` komplett abgehakt sein.

### 4. Single Source of Truth
`PROJECT_STATE.md` ist die einzige Wahrheit über den Projekt-Status.

## Regeln

- **Contracts sind Gesetz** - Keine stillen Änderungen
- **1 Step pro Antwort** - Bei AI-Coding
- **Tests für alles** - Keine Funktion ohne Test
- **Evidence required** - Keine Behauptung ohne Beweis
