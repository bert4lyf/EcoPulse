# EcoPulse — Offline-first Emergency PWA

EcoPulse is an offline-first emergency resilience PWA with a local shelter
directory, an interactive Google map, local report queue, admin report view,
and AI triage guidance.

## Create a new copy

For a fresh project, use Node.js 20 or later and run:

```powershell
npx create-next-app@latest ecopulse --typescript --tailwind --eslint --app --use-npm
cd ecopulse
npm install @ducanh2912/next-pwa lucide-react framer-motion
```

Choose the App Router if the CLI asks. In the generated project, apply the
files in the structure below. This workspace already includes the scaffold and
dependencies; from its root, run `npm install` if you need to restore them.

## Phase 1 files

```text
app/
  globals.css           # dark emergency theme
  layout.tsx            # metadata and viewport
  manifest.json         # installable web app manifest
  page.tsx              # landing page
public/
  ecopulse-icon.svg
  offline.html           # navigation fallback
src/
  components/
    Navbar.tsx           # live connection state and UI-only simulation
    OnlineStatus.tsx
    ReportForm.tsx       # local IndexedDB report queue
    ShelterCard.tsx      # animated shelter card
    ShelterList.tsx      # static data list
    ShelterMap.tsx       # Google Maps JavaScript API map
  data/
    shelters.json        # five mock shelters
  lib/
    db.ts                 # Dexie database and pending report table
  types/
    shelter.ts
next.config.ts           # @ducanh2912/next-pwa / Workbox configuration
```

The PWA plugin is disabled in development mode. The production build uses
Webpack because this plugin generates its service worker through Webpack (the
installed Next.js version otherwise defaults to Turbopack). It precaches the
start URL and generated static assets, uses NetworkFirst for navigation and
StaleWhileRevalidate for styles, scripts, and fonts, and uses
`public/offline.html` as the fallback for uncached navigations. The shelter
data is imported into the app bundle, so the rendered list does not need an API
request. `src/components/OnlineStatus.tsx` reports the browser's online status.

The report form stores entries locally in IndexedDB with `synced: false`.
`src/lib/useSyncEngine.ts` sends pending records to the mock `/api/sync`
endpoint on reconnect, on initial online load, or from the Sync Now button.
After the endpoint acknowledges the report IDs, the records are marked synced
in IndexedDB. The API uses process-local memory, not a persistent database;
synced reports disappear when the server restarts and may not be shared between
server instances. The admin page can inspect report details, but this mock
storage must be replaced with a persistent database before relying on it in a
production deployment.

The AI triage screen uses local first-aid guidance when offline. Online Gemini
requests go through `app/api/triage/route.ts`; the key is read on the server
from `GEMINI_API_KEY` and is not sent to the browser. If an older deployment
used `NEXT_PUBLIC_GEMINI_API_KEY`, rotate that key before deploying because it
may already have been included in a browser bundle. Triage guidance is not a
substitute for local emergency services.

## API keys

Copy `.env.example` to `.env.local` and set both variables before building.
Never commit `.env.local` or paste either key into source control or chat.

- **Gemini:** create a key at <https://aistudio.google.com/app/apikey> and set
  it as the server-only `GEMINI_API_KEY`.
- **Google Maps:** create or select a project in
  <https://console.cloud.google.com/google/maps-apis>, attach a billing
  account, enable **Maps JavaScript API**, then create an API key under
  **APIs & Services → Credentials**. Restrict the key to **Maps JavaScript
  API** and HTTP referrers for local development (`http://localhost:3000/*`)
  and your deployed domain (`https://your-domain.example/*`). Set the restricted
  key as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

The Google Maps key is necessarily visible in browser requests. Its security
comes from its HTTP-referrer and API restrictions, not from keeping it secret.
Add these environment variables to your hosting provider before its production
build; `NEXT_PUBLIC_` values are embedded at build time. The live map requires
network access and is not available offline.

The **Simulate offline** button changes the displayed status only. It does not
change the browser's network connection; use Chrome DevTools to test actual
offline caching.

## Run locally

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The service worker is intentionally disabled in
development, so use a production build to test offline behavior:

```powershell
npm run build
npm run start
```

Open <http://localhost:3000> while online and wait for the service worker to
install and activate. In Chrome:

1. Open DevTools → **Application** → **Service Workers** and confirm the worker
   is activated for the site.
2. Use the **Network** panel's throttling dropdown and select **Offline** (or
   use **Application** → **Service Workers** → **Offline**).
3. Reload the page. The saved EcoPulse start page and shelter list should still
   render; uncached navigations use the offline fallback.
4. Return the network setting to **Online** when finished.

Do not enable **Bypass for network** while testing—the service worker must be
allowed to serve the cached app.
