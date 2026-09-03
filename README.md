# Nexus Studio — Multi-Agent AI Infrastructure & Workflow Studio

Nexus Studio is an enterprise-grade full-stack multi-agent AI platform and workflow orchestration engine. Built with React (Vite) and Node.js (Express), it features an obsidian dark UI, real-time performance telemetry, multi-model prompt workbench, visual agent DAG builder, RAG vector knowledge base, asset studio, and API credential management.

---

## Key Features

- **Platform Overview & Telemetry**: Live token throughput velocity, p95 latency tracking, API call monitors, model load distribution, and real-time audit event stream.
- **Multi-Model Prompt Workbench**: Interactive prompt studio supporting GPT-4o, Claude 3.5 Sonnet, DeepSeek R1, and Gemini 1.5 Pro with sampling parameter tuning (temperature, max tokens, system prompts) and session history.
- **Pipelines & DAG Automation**: Visual node-based agent orchestration canvas with multi-stage execution flow (Triggers, Vector RAG, LLM Reasoning Workers, Sink Actions) and real-time stdout/stderr execution terminal.
- **RAG Knowledge Base**: Document ingestion, automated chunking, and semantic vector query simulator with real-time cosine similarity ranking.
- **Asset Studio**: Stylized multi-modal asset generation with custom presets (Photorealistic, Cyberpunk, 3D Render, Illustration, Cinematic) and high-res lightbox gallery.
- **API Credentials & Governance**: Secret token management, rate limit policies, and ready-to-use SDK code snippets in **cURL**, **Node.js**, and **Python**.
- **Plans & Capacity Modal**: Tier scaling with interactive monthly token budget calculator.

---

## Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Canvas Confetti, Custom Obsidian Design System (Plus Jakarta Sans & JetBrains Mono)
- **Backend**: Node.js, Express, CORS, Persistent Storage Engine
- **Architecture**: Monorepo with concurrent dev scripts

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/anjali-0404/Multiagent.git
cd Multiagent
```

2. Install all dependencies:
```bash
npm run install:all
```

### Running Locally

Start both the backend server and frontend development server concurrently:
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Repository Structure

```
├── package.json              # Monorepo scripts
├── .gitignore
├── README.md
├── server/                   # Backend Express Service
│   ├── package.json
│   └── src/
│       ├── index.js          # REST API entrypoint
│       ├── db/
│       │   └── database.js   # Storage & schema manager
│       ├── routes/           # API routes (stats, chat, workflows, docs, keys)
│       └── services/         # AI inference & RAG vector search logic
└── client/                   # Frontend Vite + React App
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx           # Main layout & navigation state
        ├── index.css         # Design tokens & glassmorphic styles
        ├── components/       # UI modules & views
        └── services/         # API HTTP client
```

---

## License
MIT License
