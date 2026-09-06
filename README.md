# BETWEEN US (2-Player Psychological Relationship Narrative Game)

> **"A story about how well you really know the person beside you."**
> **"เรื่องราวที่จะบอกว่า… คุณรู้จักคนที่นั่งข้างๆ ดีแค่ไหนจริงๆ"**

---

## 🌟 Overview

**BETWEEN US** is an authoritative 2-player psychological relationship narrative game built for couples and close friends. Players experience a synchronized story from asymmetric perspectives, receiving different narrative subtext, making private decisions, resolving simultaneous choices, and uncovering their **Relationship Archetype**, **Couple Dynamic**, and **Ending** at the conclusion.

- **Authoritative Server**: Colyseus WebSocket server owns all story progression, hidden traits, and ending calculations. Client is never authoritative.
- **Strict Asymmetric Isolation**: Player A never receives Player B's private options or perspective data over the wire.
- **Zero Text on Wire (Multilingual)**: Server transmits only stable identifiers (`sceneId`, `choiceId`, etc.). Each client renders in Thai (`th` - default) or English (`en`) independently.
- **Full 7-Chapter Structure**: Complete narrative arc from *Chapter 1: First Impression* to *Chapter 7: The Last Question*.
- **10-15 Minute Vertical Slice Included**: Immediate testing of asymmetric information ("The Phone Vibration"), private choices, simultaneous reveal, and dynamic consequences.
- **Canvas Social Share**: High-resolution result card image generation directly in-browser.

---

## 🏗️ Monorepo Architecture

```
├── packages/
│   ├── shared/                # Universal types, 8 traits, 8 archetypes, 8 dynamics, 12 endings
│   │   ├── src/types.ts
│   │   ├── src/archetypes.ts
│   │   ├── src/traits.ts
│   │   └── src/endings.ts
│   ├── server/                # Colyseus WebSocket Server + Express REST API
│   │   ├── src/rooms/GameRoom.ts
│   │   ├── src/engine/StoryEngine.ts
│   │   ├── src/story/scenes.ts
│   │   ├── src/db/database.ts
│   │   └── src/__tests__/
│   └── client/                # React 18 + Vite + Tailwind CSS + Web Audio
│       ├── src/i18n/          # Full Thai & English dictionaries
│       ├── src/components/    # LandingPage, LobbyPage, GameScene, RevealScreen, ResultPage, ShareCard
│       ├── src/hooks/         # useColyseus, state sync & reconnect
│       └── src/utils/sound.ts # Procedural ambient soundscapes & tension tones
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
npm run build --workspace=@between-us/shared
```

### 2. Start Backend Server
```bash
npm run dev:server
```
*Colyseus WebSocket server starts on `ws://localhost:2567` (HTTP on `http://localhost:2567`)*.

### 3. Start Web Client
```bash
npm run dev:client
```
*Client opens on `http://localhost:5173`*.

---

## 🧪 Testing Multiplayer

1. Open `http://localhost:5173` in Browser Window 1 (e.g., Chrome).
2. Click **"สร้างห้อง" (Create Room)**. Copy the 6-character room code or invite link.
3. Open `http://localhost:5173` in Browser Window 2 (e.g., Incognito or Firefox).
4. Enter the room code or use the invite link.
5. In Window 1 (Thai), keep the language in Thai. In Window 2, click `TH` at the top right to switch to `EN`.
6. Both click **Ready** and experience synchronized gameplay with asymmetric perspectives!

---

## 🛡️ Automated Tests
```bash
npm test --workspace=@between-us/server
```
Runs authoritative engine unit tests verifying:
- Narrative and choice state transitions.
- Strict isolation of Player A and Player B choices.
- Archetype, couple dynamic, and ending computations.
