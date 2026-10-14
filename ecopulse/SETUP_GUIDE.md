# EcoPulse Phase 1 MVP - Setup & Running Guide

## 📋 Project Overview

**EcoPulse** is an offline-first Progressive Web App (PWA) for emergency resilience. Phase 1 MVP includes:

- ✅ Responsive shelter listing with real-time online/offline status
- ✅ PWA Service Worker caching for offline functionality
- ✅ Dark mode emergency aesthetic with high-contrast UI
- ✅ Framer Motion transitions and animations
- ✅ Lucide React icons for accessibility and medical support indicators

## 📦 Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS** (dark mode, high-contrast emergency theme)
- **@ducanh2912/next-pwa** (Service Worker, offline caching)
- **lucide-react** (emergency/medical icons)
- **framer-motion** (smooth UI transitions)

## 🚀 Quick Start

### Step 1: Navigate to the Project

```bash
cd C:\Users\ADMIN\Desktop\ECOPulse\ecopulse
```

### Step 2: Install Dependencies (Already Done)

All dependencies have been installed. To verify:

```bash
npm ls
```

### Step 3: Run the Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

## 📁 Project Structure

```
ecopulse/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx              # Top navigation with online/offline indicator
│   │   ├── ShelterCard.tsx         # Individual shelter card component
│   │   ├── ShelterList.tsx         # Grid of shelter cards
│   │   └── OfflineToggle.tsx       # Button to simulate offline mode (for testing)
│   ├── data/
│   │   └── shelters.json           # Mock shelter data (5 shelters)
│   ├── layout.tsx                  # Root layout with PWA metadata
│   ├── page.tsx                    # Home page
│   └── globals.css                 # Global dark theme and emergency styling
├── public/
│   ├── manifest.json               # PWA manifest for app metadata
│   └── [icons] (coming Phase 2)
├── next.config.ts                  # Next.js + PWA configuration
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

## 🎨 UI Features

### Navbar
- Sticky header with "EcoPulse" branding
- Real-time online/offline status indicator (Green: Online, Red: Offline with pulse)
- Responsive design

### Shelter Cards
- Status badge: Green "Open" or Red "Full"
- Capacity display
- Coordinates (latitude/longitude)
- ADA accessibility badge (blue)
- Medical support badge (purple)
- Smooth Framer Motion animations on load
- Responsive grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

### Offline Toggle (Bottom Right)
- Simulates going offline for testing purposes
- Green "Online Mode" / Red "Offline Mode" button
- Provides visual feedback

### Emergency Aesthetic
- **Colors**: Dark gray backgrounds (#0a0a0a), bright red accents (#dc2626), amber warnings
- **Typography**: Large, readable fonts (18px+ for body, 24px+ for headings)
- **Contrast**: High contrast for low-light emergency situations
- **Icons**: Clear, large emergency/medical icons

## 🔧 PWA Configuration

### PWA Features Enabled

1. **Service Worker Caching** (`@ducanh2912/next-pwa`)
   - Caches app shell and static assets
   - Works offline after initial load
   - Configured in `next.config.ts`

2. **Manifest.json** (`public/manifest.json`)
   - Defines app name, icons, theme colors
   - Enables "Add to Home Screen" on mobile
   - Sets theme color to red (#dc2626)

3. **App Shell Strategy**
   - All static assets cached on first load
   - App works offline immediately after initial visit

## 📱 Testing Offline Mode

### Option 1: Using the Offline Toggle Button

1. Run the app locally
2. Click the **"Online Mode"** / **"Offline Mode"** button (bottom right)
3. This simulates offline behavior for testing
4. The navbar indicator will show "Offline" status

### Option 2: Using Chrome DevTools

1. Open **Chrome DevTools** (F12 or Ctrl+Shift+I)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. Find the EcoPulse service worker and check **Offline**
5. Refresh the page (Ctrl+R)
6. The app should load with cached assets even though the server is offline

### Option 3: Disable Network

1. Open **Chrome DevTools** (F12)
2. Go to **Network** tab
3. Check **Offline** checkbox
4. Refresh the page
5. App will load from cache

## 📊 Mock Shelter Data

The app includes 5 mock shelters in `app/data/shelters.json`:

```json
{
  "id": "shelter-001",
  "name": "Central Community Center",
  "lat": 40.7128,
  "lng": -74.0060,
  "status": "Open",           // "Open" or "Full"
  "capacity": 250,
  "ada_accessible": true,     // boolean
  "medical_support": true     // boolean
}
```

**Fields:**
- `id`: Unique identifier
- `name`: Shelter name
- `lat`, `lng`: Coordinates (NYC area for demo)
- `status`: "Open" or "Full"
- `capacity`: Max capacity
- `ada_accessible`: ADA accessibility
- `medical_support`: Medical staff/supplies available

## 🔍 Checking Service Worker Registration

1. Open **Chrome DevTools** (F12)
2. Go to **Application** > **Service Workers**
3. You should see the EcoPulse service worker registered
4. Status should show "running"

## 📦 Build for Production

```bash
npm run build
```

This generates an optimized production build with PWA support.

To test the production build locally:

```bash
npm run build
npm start
```

Then visit **http://localhost:3000**

## 🎯 Phase 1 MVP Deliverables

- ✅ Project initialized with Next.js 14, TypeScript, Tailwind CSS
- ✅ PWA configured with Service Worker caching
- ✅ Responsive navbar with online/offline indicator
- ✅ ShelterList component displaying 5 mock shelters
- ✅ ShelterCard component with status, capacity, ADA, and medical badges
- ✅ Dark mode emergency aesthetic (dark gray + bright red/amber)
- ✅ Framer Motion animations
- ✅ OfflineToggle button for testing offline mode
- ✅ Manifest.json configured for PWA

## 🚀 Phase 2 (Coming Next)

- Map integration (Google Maps or Mapbox)
- Real-time location tracking
- Geolocation-based shelter finder
- Backend API integration
- Real shelter data
- Distance calculations

## 📝 Notes

- **Offline Toggle**: The button in the bottom right is for testing purposes only. In production, it would be removed.
- **Service Worker**: Automatically generated by `@ducanh2912/next-pwa`. No manual configuration needed beyond `next.config.ts`.
- **Icons**: Lucide React icons are used. Add more as needed: `import { IconName } from "lucide-react"`
- **Styling**: Tailwind CSS is configured in `tailwind.config.ts`. Customize the emergency theme there.

## 🛠️ Troubleshooting

### Service Worker Not Registered

1. Check browser console for errors
2. Verify `next.config.ts` has PWA configuration
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+Shift+R)

### Offline Mode Not Working

1. Ensure service worker is registered (see above)
2. Make sure you've visited the site online first
3. Try DevTools Method 2 (Application > Service Workers > Offline checkbox)

### Build Errors

1. Run `npm audit fix` to fix dependencies
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Run `npm run build`

## 📄 License

Built for the hackathon. Use freely for the project.

---

**Happy coding! 🚀 Ready to build Phase 2 with maps and real data?**
