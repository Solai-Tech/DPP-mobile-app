# DPP Mobile App (CirTag) — Claude Code Instructions

## Project Overview
React Native / Expo mobile app for Digital Product Passports. Users scan QR codes or barcodes to view product sustainability data, chat with AI about products, and analyze circuit boards via camera.

## Repository
- **GitHub**: https://github.com/Solai-Tech/DPP-mobile-app.git
- **Branch**: `main`

---

## Architecture

```
DPP-mobile-app/
├── CirtagRN/                    # Main Expo/React Native app
│   ├── app/                     # Expo Router screens (file-based routing)
│   │   ├── (tabs)/              # Tab navigator screens
│   │   │   ├── _layout.tsx      # Tab bar config (Home, Scan, Circuit, Tickets, Profile)
│   │   │   ├── index.tsx        # Home tab — welcome card, recent scans, quick actions
│   │   │   ├── scan.tsx         # QR/Barcode scanner tab
│   │   │   ├── circuit.tsx      # Circuit Board Scanner — camera + PCB analysis
│   │   │   ├── tickets.tsx      # Support tickets list
│   │   │   └── profile.tsx      # User profile & settings menu
│   │   ├── product/
│   │   │   └── [id].tsx         # Dynamic product detail page (specs, CO2, documents)
│   │   ├── _layout.tsx          # Root layout (Stack navigator wrapping tabs)
│   │   ├── product-chat.tsx     # AI chatbot per product (Flowise)
│   │   ├── support-chat.tsx     # General support chatbot
│   │   ├── documents.tsx        # Product documents viewer
│   │   ├── pdf-viewer.tsx       # Full-screen PDF viewer
│   │   ├── lifecycle.tsx        # Product lifecycle timeline
│   │   ├── raise-ticket.tsx     # Create support ticket form
│   │   ├── settings.tsx         # App settings
│   │   ├── preferences.tsx      # User preferences
│   │   ├── notifications.tsx    # Notification settings
│   │   ├── about.tsx            # About page
│   │   ├── help.tsx             # Help & FAQ
│   │   ├── privacy.tsx          # Privacy policy
│   │   └── webview.tsx          # Generic webview screen
│   │
│   ├── src/
│   │   ├── components/          # 28 reusable UI components
│   │   │   ├── CirtagLogo.tsx          # App logo
│   │   │   ├── WelcomeCard.tsx         # Home screen greeting
│   │   │   ├── HomeActionCard.tsx      # Quick action cards on home
│   │   │   ├── SavedProductCard.tsx    # Product card in lists
│   │   │   ├── ProductHistoryCard.tsx  # Scan history card
│   │   │   ├── ScanFrame.tsx           # Camera overlay frame
│   │   │   ├── ScanTypeToggle.tsx      # QR/Barcode toggle
│   │   │   ├── Co2GridCard.tsx         # CO2 data display
│   │   │   ├── EmissionBar.tsx         # Emission visualization bar
│   │   │   ├── EmissionBreakdown.tsx   # PCF lifecycle breakdown
│   │   │   ├── DocumentCard.tsx        # Document download card
│   │   │   ├── SpecRow.tsx / SpecSection.tsx  # Product specs display
│   │   │   ├── ChatBubble.tsx          # Chat message bubble
│   │   │   ├── TicketCard.tsx          # Support ticket card
│   │   │   ├── LifecycleTimeline.tsx   # Product lifecycle view
│   │   │   ├── LoadingOverlay.tsx      # Full-screen loader
│   │   │   ├── InlineProductWebView.tsx # Embedded product webview
│   │   │   └── ...                     # ActionButton, StatCard, badges, etc.
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useCamera.ts            # Camera permissions + state
│   │   │   ├── useProducts.ts          # Product CRUD (SQLite)
│   │   │   ├── useTickets.ts           # Ticket CRUD (SQLite)
│   │   │   ├── useProductChat.ts       # Chat state + Flowise integration
│   │   │   └── useUserProfile.ts       # User profile state
│   │   │
│   │   ├── database/            # Local SQLite DAOs (expo-sqlite)
│   │   │   ├── database.ts             # DB init, schema creation
│   │   │   ├── scannedProductDao.ts    # CRUD for scanned products
│   │   │   └── ticketDao.ts            # CRUD for support tickets
│   │   │
│   │   ├── types/               # TypeScript interfaces
│   │   │   ├── CircuitBoard.ts         # PCB analysis types
│   │   │   ├── ScannedProduct.ts       # Product data model
│   │   │   ├── Ticket.ts              # Support ticket model
│   │   │   └── UserProfile.ts         # User profile model
│   │   │
│   │   ├── utils/               # API clients & helpers
│   │   │   ├── circuitBoardApi.ts      # DPP server PCB analysis API
│   │   │   ├── flowiseApi.ts           # Flowise chatbot API
│   │   │   ├── productDataFetcher.ts   # Web scraping product data from URLs
│   │   │   ├── barcodeHelpers.ts       # Barcode/QR parsing
│   │   │   ├── webTitleFetcher.ts      # Fetch page titles from URLs
│   │   │   ├── webviewScripts.ts       # JS injection for webviews
│   │   │   ├── scale.ts               # Responsive scaling (s, vs, ms)
│   │   │   └── dateFormatter.ts       # Date formatting utils
│   │   │
│   │   └── theme/               # Design system
│   │       ├── colors.ts               # Color palette
│   │       ├── theme.ts               # Spacing, shadows, common styles
│   │       └── typography.ts          # Font sizes and weights
│   │
│   ├── assets/                  # Images (icon, splash, logo)
│   ├── app.json                 # Expo config (name, plugins, permissions)
│   ├── app.config.js            # Runtime config — loads env vars into extra
│   ├── .env.example             # Environment template
│   ├── .env.local               # Actual env values (gitignored normally, force-pushed for team)
│   ├── babel.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── pcb-backend/                 # DEPRECATED — Node.js PCB server (replaced by DPP server)
│   ├── server.js                # Was: Express + GPT-4 Vision. Now handled by DPP Django
│   ├── package.json
│   └── .env.example
│
├── docs/
│   └── privacy-policy.html
│
└── README.md
```

---

## Key Patterns

### Environment Variables
- All env vars are loaded in `app.config.js` and exposed via `Constants.expoConfig.extra`
- Access pattern in code: `Constants.expoConfig?.extra?.variableName`
- Copy `.env.example` to `.env.local` for local dev
- See `.env.local` (force-pushed) for team credentials

### API Integrations
| API | File | Server |
|-----|------|--------|
| PCB Analysis | `src/utils/circuitBoardApi.ts` | DPP Django (`/dppx/api/v1/pcb/analyze/`) |
| Chatbot | `src/utils/flowiseApi.ts` | Flowise (per-host chatflow mapping) |
| Chat Save | `src/utils/flowiseApi.ts` | DPP Django (`/dppx/get-chats/`) |
| Product Data | `src/utils/productDataFetcher.ts` | Web scraping from product URLs |

### PCB Analysis Flow (Circuit Board Scanner)
```
circuit.tsx  →  circuitBoardApi.ts  →  POST /dppx/api/v1/pcb/analyze/
                                        (DPP Django server)
                                        Auth: X-Client-ID + X-Client-Secret
                                        Body: { image (base64), weight, width, height }
                                        Returns: { category, price, pcf, productId, productUrl, ... }
```

The DPP server handles everything: GPT-4o Vision analysis, pricing, PCF calculation, and product creation. The mobile app is a thin client.

### Navigation
- **Expo Router** with file-based routing
- Root `_layout.tsx` = Stack navigator
- `(tabs)/_layout.tsx` = Bottom tab bar (5 tabs)
- Dynamic routes: `product/[id].tsx`

### Local Storage
- **expo-sqlite** for offline product and ticket storage
- Schema created in `src/database/database.ts`
- DAOs: `scannedProductDao.ts`, `ticketDao.ts`

### Styling
- No CSS framework — pure React Native `StyleSheet`
- Responsive scaling via `src/utils/scale.ts` (`s()`, `vs()`, `ms()`)
- Design tokens in `src/theme/` (colors, typography, spacing)
- Common palette: sage green (#5A8C5A), cream (#F7F5F0), dark text (#2C3E2D)

---

## Development

### Setup
```bash
cd CirtagRN
cp .env.example .env.local   # Or use the committed .env.local
npm install
npx expo start
```

### Build
```bash
npx expo run:android
npx expo run:ios
```

### Key Dependencies
- React Native 0.81 + Expo 54
- expo-camera (QR/barcode + photo capture)
- expo-sqlite (local DB)
- expo-router (file-based navigation)
- react-native-webview (product pages)
- react-native-pdf (document viewing)

---

## DPP Server Connection
The mobile app connects to the DPP Django server for:
1. **PCB Analysis** — `POST /dppx/api/v1/pcb/analyze/` (auth via ExternalAPIClient)
2. **Chat saving** — `POST /dppx/get-chats/`
3. **Product viewing** — webview loads `/dpp/product/{id}/`

Server repo: `/Users/harsol/PycharmProjects/SolAI/GIT-NEW/DPP/`
Server docs: See `DPP/CLAUDE.md`

---

## Important Notes
- `pcb-backend/` is **deprecated** — all PCB analysis now runs on DPP Django server
- Never hardcode API URLs or credentials — use `app.config.js` + `.env.local`
- The app is published as "CirTag" (com.anonymous.CirtagRN)
