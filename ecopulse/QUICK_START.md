# EcoPulse Phase 1 MVP - Quick Start Checklist

## ✅ Pre-Launch Checklist

- [x] Next.js 14+ project created
- [x] TypeScript configured
- [x] Tailwind CSS dark mode theme
- [x] All dependencies installed (@ducanh2912/next-pwa, lucide-react, framer-motion)
- [x] PWA Service Worker configured
- [x] manifest.json created
- [x] Mock shelter data created (5 shelters)
- [x] All components built (Navbar, ShelterCard, ShelterList, OfflineToggle)
- [x] Production build tested ✅
- [x] Development server running ✅

---

## 🚀 Step-by-Step Launch

### 1. Open Terminal
```powershell
cd C:\Users\ADMIN\Desktop\ECOPulse\ecopulse
```

### 2. Start Development Server
```powershell
npm run dev
```

**Expected output:**
```
▲ Next.js 16.4.0 (Turbopack)
- Local:   http://localhost:3000
✓ Ready in 3.6s
```

### 3. Open Browser
Visit: **http://localhost:3000**

### 4. What You'll See

```
┌─────────────────────────────────────────────────────────┐
│  [EP] EcoPulse                         🟢 Online        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Emergency Shelters                                     │
│  ⚠️  5 shelters available                              │
│                                                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐
│  │ Shelter 1       │ │ Shelter 2       │ │ Shelter 3   │
│  │ 🟢 Open         │ │ 🟢 Open         │ │ 🔴 Full     │
│  │ ...             │ │ ...             │ │ ...         │
│  └─────────────────┘ └─────────────────┘ └─────────────┘
│  
│  ┌─────────────────┐ ┌─────────────────┐
│  │ Shelter 4       │ │ Shelter 5       │
│  │ 🟢 Open         │ │ 🟢 Open         │
│  │ ...             │ │ ...             │
│  └─────────────────┘ └─────────────────┘
│
│                              ┌──────────────────┐
│                              │ 🟢 Online Mode   │
│                              │ (Toggle button)  │
│                              └──────────────────┘
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Offline Functionality (2 Methods)

### Method A: Click the Toggle Button
1. Look for the button in the **bottom-right corner**
2. Click "🟢 Online Mode" 
3. Button changes to "🔴 Offline Mode" and pulses
4. Navbar status changes to red "Offline"
5. Shelters still display (from cache!)

### Method B: Chrome DevTools
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. Check the **Offline** checkbox
5. Refresh page (`Ctrl+R`)
6. **App loads completely from cache!**

---

## 📁 Project Files Created

### Components (Ready to Use)
```
app/components/
├── Navbar.tsx              ← Online/Offline status
├── ShelterCard.tsx         ← Individual shelter
├── ShelterList.tsx         ← All shelters grid
└── OfflineToggle.tsx       ← Test button
```

### Data
```
app/data/
└── shelters.json           ← 5 mock shelters
```

### Configuration
```
next.config.ts             ← PWA setup
public/manifest.json       ← App metadata
app/globals.css            ← Dark theme
```

---

## 🎯 Feature Verification

### Navbar
- [ ] Shows "EcoPulse" branding
- [ ] Displays online/offline status (green/red)
- [ ] Status updates when clicking toggle button

### Shelter Cards
- [ ] 3 cards per row on desktop
- [ ] 2 cards per row on tablet
- [ ] 1 card per row on mobile
- [ ] Cards show name, status, capacity, coordinates
- [ ] ADA accessibility badge visible (when applicable)
- [ ] Medical support badge visible (when applicable)
- [ ] Cards animate smoothly on page load

### Offline Mode
- [ ] Toggle button visible (bottom-right)
- [ ] Button changes color when clicked
- [ ] Navbar status indicator updates
- [ ] Shelters still visible when offline
- [ ] No network requests (check DevTools Network tab)

### Dark Theme
- [ ] Background is dark gray (#0a0a0a)
- [ ] Text is readable white/light gray
- [ ] Red accents for important info (#dc2626)
- [ ] Amber/yellow for warnings
- [ ] High contrast (good for emergency use)

---

## 🔍 Advanced Verification (DevTools)

### Check Service Worker
1. DevTools → Application → Service Workers
2. Should show "registered" and "running"

### Check Cache
1. DevTools → Application → Cache Storage
2. Should have cache entries for static files

### Check Network Offline
1. DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh page
4. Should have 0 failed requests (all from cache)

### Check Manifest
1. DevTools → Application → Manifest
2. Should show app name, icons, theme color

---

## 📊 Shelf Data Preview

Each shelter has:
- **id**: Unique identifier (shelter-001, shelter-002, etc.)
- **name**: Shelter name
- **lat/lng**: GPS coordinates
- **status**: "Open" or "Full"
- **capacity**: Max occupancy
- **ada_accessible**: true/false
- **medical_support**: true/false

---

## ⚡ Performance Tips

- First load: ~2-3 seconds
- Subsequent loads: ~1 second (from cache)
- Offline loads: <1 second (pure cache)
- Bundle size: Optimized by Next.js

---

## 🐛 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| Blank page | Clear cache: `Ctrl+Shift+Delete` → Hard refresh: `Ctrl+Shift+R` |
| Service worker not showing | Restart dev server: `Ctrl+C` then `npm run dev` |
| Port 3000 busy | Kill process or use: `npm run dev -- -p 3001` |
| Module errors | `npm install` to verify dependencies |
| Build errors | `rm -r .next` then `npm run dev` |

---

## 📞 Need Help?

1. **Setup issues?** → Read `SETUP_GUIDE.md`
2. **Offline testing?** → Check `INSTALLATION_GUIDE.md` → Testing Offline Mode
3. **Component questions?** → Code is well-commented, check files in `app/components/`
4. **Want to modify?** → Edit `app/data/shelters.json` to add more shelters

---

## 🎉 You're All Set!

The EcoPulse Phase 1 MVP is complete and running. You have:

✅ A fully functional offline-first PWA
✅ Responsive design (mobile, tablet, desktop)
✅ Dark mode emergency aesthetic
✅ Service Worker caching
✅ Mock shelter data
✅ Testing tools built-in

**Next steps:**
1. Run `npm run dev`
2. Open http://localhost:3000
3. Click the toggle button to test offline
4. Deploy Phase 2 features (maps, real data, etc.)

---

**Happy coding! 🚀 Your emergency resilience app is live!**
