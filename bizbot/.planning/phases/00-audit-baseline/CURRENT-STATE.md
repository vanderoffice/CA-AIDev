# BizBot Current State Snapshot
**Date:** 2026-02-14

## Modes
- [x] Chat (general Q&A via "Just Chat" mode selection)
- [x] Guided Setup (intake form for personalized licensing guidance)
- [x] License Finder (structured input for permit/license lookup)

Mode selection screen renders three cards: Guided Setup (orange), Just Chat (blue), License Finder (green). Initial state is `choice`. After intake completion or "Just Chat" selection, transitions to `chat` mode. License Finder has its own full-screen component.

## Component Usage
| Component | Imported? | Used? |
|-----------|-----------|-------|
| ChatMessage | Yes (from `../lib/bots`) | Yes (renders all chat messages) |
| getMarkdownComponents | No | No |
| react-markdown | No (in BizBot.jsx) | No (but LicenseFinder.jsx imports it directly) |
| remark-gfm | No (in BizBot.jsx) | No (but LicenseFinder.jsx imports it directly) |
| DecisionTreeView | No | No |
| WizardStepper | No | No |

### Additional Components
| Component | Imported? | Used? |
|-----------|-----------|-------|
| IntakeForm | Yes (from `../components/bizbot/IntakeForm`) | Yes (Guided Setup mode) |
| LicenseFinder | Yes (from `../components/bizbot/LicenseFinder`) | Yes (License Finder mode) |
| BotHeader | Yes (from `../components/BotHeader`) | Yes (chat/intake headers) |
| useBotPersistence | Yes (from `../hooks/useBotPersistence`) | Yes (session state) |

## Rendering Pipeline
BizBot chat messages use the shared `<ChatMessage message={message} linkColor="orange" />` component from `src/lib/bots/`. ChatMessage internally handles markdown rendering, but BizBot does NOT import `getMarkdownComponents` or wire up the full WaterBot-style rendering pipeline (gradient bubbles with styled markdown, pill sources, heading hierarchy, accent-tinted code pills, styled tables).

User messages render in orange-tinted bubbles (`bg-orange-500/10 border border-orange-500/20`). Assistant messages render in gradient neutral bubbles (`bg-gradient-to-b from-neutral-800/90 to-neutral-800/60`).

The LicenseFinder component separately imports `react-markdown` and `remark-gfm` for rendering license detail descriptions, with its own `autoLinkUrls()` utility function.

Sources data is included in webhook responses (`data.sources`) but is NOT rendered with pill-style citation UI. The `agentUsed` field is displayed as a small text badge below messages.

## Webhook Endpoints
| Endpoint | Status | Response Shape |
|----------|--------|----------------|
| /webhook/bizbot | 200 OK (3.5s) | `{response, sessionId, userLevel, mode, sources, _debug_test}` |
| /webhook/bizbot-licenses | 200 OK (3.6s) | `{response, sources, chunksUsed}` |
| /webhook/bizbot-license-finder | 400 (0.25s) | `{error: "industry is required"}` — expected validation, needs structured `{industry, city, entityType}` |

## Lines of Code
- BizBot.jsx: 475 lines
- IntakeForm.jsx: 769 lines
- LicenseFinder.jsx: 704 lines
- **Total BizBot frontend:** 1,948 lines

## Session & State Management
- Uses `useBotPersistence('bizbot')` hook for sessionStorage persistence
- Tracks: sessionId, messages, mode, businessContext
- Mode states: `choice` -> `intake`/`chat`/`finder`
- Business context passed from IntakeForm or LicenseFinder to chat mode
- FAQ quick-access chips (6) and suggested questions (4) in empty chat state

## UI Features Present
| Feature | Status |
|---------|--------|
| Mode selection screen | Present |
| FAQ quick-access chips | Present (6 chips) |
| Suggested starter questions | Present (4 questions) |
| Gradient message bubbles | Present |
| User/bot avatars | Present |
| Loading spinner | Present |
| Business context banner | Present (after intake) |
| Agent badge | Present (shows which agent handled query) |
| Session ID display | Present |
| Pill-style sources | Missing |
| Full markdown rendering | Missing (partial via ChatMessage) |
| Cross-tool CTAs | Present (mode transitions) |
| Error handling | Present |
| Responsive layout | Present |
