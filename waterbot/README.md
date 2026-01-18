# WaterBot 💧

**California Water Boards RAG Chatbot**

WaterBot is an AI-powered assistant that helps users navigate California's complex water regulations, permits, and funding programs. Built with React and powered by Retrieval-Augmented Generation (RAG), it provides accurate, source-cited answers about water quality compliance, NPDES permits, and infrastructure funding opportunities.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Private-red)

---

## 🎯 Overview

WaterBot serves as a digital guide to California's State Water Resources Control Board (SWRCB) and its nine Regional Water Quality Control Boards. It helps:

- **Small business owners** needing water discharge permits
- **Environmental organizations** seeking restoration funding
- **Agricultural operations** managing compliance requirements
- **Local governments** pursuing infrastructure financing
- **Non-profits** working with water resources

### Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Ask WaterBot** | ✅ Live | RAG-powered chat with source citations |
| **Permit Finder** | 🔜 Coming | Decision tree tool for permit requirements |
| **Funding Navigator** | 🔜 Coming | Eligibility checker for water infrastructure grants |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    React + Vite + Tailwind CSS                  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      n8n Workflow Engine                        │
│                   n8n.vanderdev.net/webhook/waterbot            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Webhook    │→ │ Vector Search │→ │   Claude Sonnet LLM  │  │
│  │   Receiver   │  │  (pgvector)   │  │   with RAG Context   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                          │
│              pgvector extension (1536 dimensions)               │
│                   waterbot_documents table                      │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3.4 |
| **Backend** | n8n webhooks (workflow automation) |
| **Vector Database** | Supabase PostgreSQL + pgvector |
| **Embeddings** | OpenAI `text-embedding-3-small` (1536 dim) |
| **LLM** | Claude Sonnet |
| **Similarity** | Cosine similarity, threshold > 0.70 |
| **Hosting** | Hostinger (via GitHub Actions FTP deploy) |

---

## 📁 Project Structure

```
waterbot/
├── .planning/                    # Project management files
│   ├── PROJECT.md               # Project definition
│   ├── ROADMAP.md               # Development phases
│   ├── RESUME.md                # Session handoff state
│   └── phases/                  # Individual phase plans
│
├── knowledge/                    # RAG knowledge base (markdown)
│   ├── 03-permits/              # Permit documentation
│   │   ├── npdes/               # National Pollutant Discharge
│   │   ├── wdr/                 # Waste Discharge Requirements
│   │   ├── 401-certification/   # Federal water quality cert
│   │   ├── water-rights/        # Appropriative & riparian
│   │   └── habitat-restoration/ # SHRO, SRGO permits
│   ├── 04-funding/              # Funding programs
│   │   ├── srf/                 # State Revolving Funds
│   │   ├── federal/             # WIFIA, EPA grants
│   │   ├── grants/              # State grant programs
│   │   └── private/             # Private funding sources
│   ├── 05-compliance/           # Enforcement & violations
│   ├── 06-water-quality/        # Water quality standards
│   ├── 07-entities/             # Regional boards info
│   ├── 08-water-rights/         # Water rights system
│   ├── 09-climate-drought/      # Climate adaptation
│   └── 10-public-resources/     # Public tools & databases
│
├── scripts/                      # RAG pipeline scripts
│   ├── chunk-knowledge.js       # Markdown → chunks processor
│   ├── embed-chunks.py          # Chunk → vector embeddings
│   └── chunks.json              # Generated chunk data (1.5MB)
│
├── src/
│   ├── components/              # Reusable UI components
│   ├── config/
│   │   └── supabase.js          # Database configuration
│   ├── pages/
│   │   └── WaterBot.jsx         # Main chat interface
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
│
├── index.html                    # HTML entry point
├── package.json                  # Dependencies
├── vite.config.js               # Vite bundler config
├── tailwind.config.js           # Tailwind theme config
├── postcss.config.js            # PostCSS plugins
└── WATERBOT-PROJECT-HANDOFF.md  # Complete project context
```

---

## 🧠 RAG Pipeline

The Retrieval-Augmented Generation pipeline ensures accurate, source-cited responses.

### 1. Knowledge Ingestion

```bash
# Step 1: Chunk markdown documents by H2 sections
node scripts/chunk-knowledge.js

# Step 2: Generate embeddings and insert into Postgres
export OPENAI_API_KEY='your-key'
python scripts/embed-chunks.py
```

### 2. Chunking Strategy

The chunker (`chunk-knowledge.js`) implements a semantic chunking approach:

- **Split on H2 headers** — Each `## Section` becomes a chunk
- **Preserve hierarchy** — H3 subsections stay with their parent H2
- **Add document context** — Each chunk is prefixed with the document title (H1)
- **Size limits** — Max 2000 chars per chunk, min 100 chars
- **Paragraph-aware splitting** — Large chunks split on `\n\n` boundaries

### 3. Vector Search Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| Embedding Model | `text-embedding-3-small` | 1536 dimensions |
| Similarity Metric | Cosine | Standard for text |
| Threshold | 0.70 | Minimum relevance score |
| Top-K | 8 | Chunks retrieved per query |

### 4. n8n Workflow

The backend workflow handles:
1. **Receive** — Webhook accepts user message + session history
2. **Embed** — Generate embedding for user query
3. **Search** — pgvector similarity search (top 8 chunks)
4. **Augment** — Inject relevant chunks into Claude prompt
5. **Generate** — Claude Sonnet produces response with citations
6. **Return** — JSON response with answer + sources

**Critical Pattern** (from KiddoBot learnings):
```javascript
// Always set on vector search node to handle empty results
alwaysOutputData: true
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- OpenAI API key (for embeddings)
- Access to n8n instance (for backend)
- Supabase/PostgreSQL with pgvector

### Installation

```bash
# Clone the repository
git clone https://github.com/vanderoffice/CA-AIDev.git
cd CA-AIDev/waterbot

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`.

### Environment Setup

The frontend communicates with the n8n webhook at:
```
https://n8n.vanderdev.net/webhook/waterbot
```

For local development with a different backend, update `CHAT_WEBHOOK_URL` in `src/pages/WaterBot.jsx`.

### Build for Production

```bash
npm run build
```

Output is written to `dist/` directory.

---

## 📚 Knowledge Base

### Document Format

All knowledge documents use markdown with structured content:

```markdown
# Document Title

Brief introduction paragraph.

## Section Heading

Content organized by topic...

### Subsection

More detailed information...

## Another Section

Additional content...
```

### Categories

| Category | Content |
|----------|---------|
| **permits** | NPDES, WDR, 401 Certification, Water Rights, Habitat Restoration |
| **funding** | CWSRF, DWSRF, SAFER, Propositions 1/4/68, WIFIA |
| **compliance** | Enforcement, violations, monitoring requirements |
| **water-quality** | Standards, TMDLs, beneficial uses |
| **entities** | Regional boards, contact information |
| **water-rights** | Appropriative, riparian, temporary permits |
| **climate-drought** | Conservation, drought response, adaptation |
| **public-resources** | CIWQS, GeoTracker, public databases |

### Adding New Knowledge

1. Create a markdown file in the appropriate `knowledge/` subdirectory
2. Follow the H1 → H2 → H3 heading hierarchy
3. Run the chunking script:
   ```bash
   node scripts/chunk-knowledge.js
   ```
4. Generate and upload embeddings:
   ```bash
   python scripts/embed-chunks.py
   ```

---

## 🎨 UI Components

### Main Interface (`WaterBot.jsx`)

The chat interface provides:

- **Mode Selection** — Landing screen with feature choices
- **Chat Mode** — Conversational interface with message history
- **Suggested Questions** — Quick-start prompts for new users
- **Source Citations** — Transparent sourcing for all responses
- **Session Persistence** — Chat history saved in sessionStorage

### Color Theme

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Primary | Sky Blue | `sky-500` |
| Accent | Cyan | `cyan-500` |
| Background | Neutral Dark | `neutral-900` |
| Text | White/Gray | `white`, `neutral-400` |

---

## 🔧 Configuration Files

### `vite.config.js`
- React plugin with Fast Refresh
- Production build to `dist/`
- ESBuild minification

### `tailwind.config.js`
- Custom `water-blue` color (`#0ea5e9`)
- Inter font family (sans)
- JetBrains Mono (monospace)

### `postcss.config.js`
- Tailwind CSS processing
- Autoprefixer for browser compatibility

---

## 📋 Disclaimer

> **WaterBot provides general information about California Water Boards regulations, permits, and funding programs. This information is for educational purposes only and does not constitute official guidance or legal advice.**
>
> Permit requirements vary by project and location. Always confirm requirements with the appropriate Regional Water Quality Control Board or the State Water Resources Control Board before proceeding with any project.
>
> **For official information:**
> - State Water Board: (916) 341-5250
> - Find your Regional Board: [waterboards.ca.gov/waterboards_map.html](https://www.waterboards.ca.gov/waterboards_map.html)

---

## 🗺️ Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Infrastructure | ✅ Complete | Schema, n8n workflows, UI skeleton |
| 2. Foundation | ✅ Complete | Core knowledge documents |
| 3. Permits | ✅ Complete | NPDES, WDR, 401, Water Rights docs |
| 4. Funding | ✅ Complete | SRF, grants, federal programs |
| 5. Additional Topics | ✅ Complete | Compliance, water quality, climate |
| 6. Tools | 🔜 Planned | Permit Finder, Funding Navigator |
| 7. Vector DB Tuning | 🔜 Planned | Accuracy optimization |
| 8. QA/Deploy | 🔜 Planned | Final testing, production launch |

---

## 🤝 Related Projects

WaterBot is part of the **CA-AIDev** suite of California government assistance chatbots:

- **KiddoBot** — Childcare assistance navigator
- **BizBot** — Business licensing guide
- **WaterBot** — Water regulations assistant (this project)

All bots share the same architecture pattern for consistency and maintainability.

---

## 📄 License

This project is private and proprietary to vanderdev.net.

---

## 🔗 Resources

- [California Water Boards](https://www.waterboards.ca.gov/)
- [Find Your Regional Board](https://www.waterboards.ca.gov/waterboards_map.html)
- [CIWQS Database](https://ciwqs.waterboards.ca.gov/)
- [Electronic Filing System](https://efiling.waterboards.ca.gov/)
- [Financial Assistance Programs](https://www.waterboards.ca.gov/water_issues/programs/grants_loans/)
