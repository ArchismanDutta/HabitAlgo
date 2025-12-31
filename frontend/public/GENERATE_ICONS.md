# 🎨 How to Generate PWA Icons

The app is currently missing PWA icons. You need to generate them before deployment.

## ⚠️ Missing Icons

The following icons are required but missing:
- `pwa-64x64.png`
- `pwa-192x192.png`
- `pwa-512x512.png`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180×180)
- `apple-touch-icon-152x152.png`
- `apple-touch-icon-120x120.png`
- `apple-touch-icon-76x76.png`

## 🚀 Quick Fix (Automated)

### Option 1: PWA Asset Generator (Recommended)

1. **Create a master icon** (1024×1024 PNG):
   - Simple design with HabitAlgo branding
   - Target/bullseye icon with gradient background (#6366f1)
   - Save as `icon.png` in this folder

2. **Generate all icons**:
   ```bash
   cd frontend
   npm install -g @vite-pwa/assets-generator
   npx @vite-pwa/assets-generator --preset minimal public/icon.png
   ```

### Option 2: Online Tool

1. Go to [https://realfavicongenerator.net/](https://realfavicongenerator.net/)
2. Upload your master icon (512×512 or larger)
3. Configure settings:
   - iOS: Background color #6366f1
   - Android: Enable maskable
4. Download ZIP
5. Extract all files to this `public/` folder

### Option 3: Use Placeholder SVG (Temporary)

For development only, you can use the `pwa-icon-placeholder.svg` file:

```bash
# Install ImageMagick or use an online converter
# Convert SVG to PNG at different sizes
convert pwa-icon-placeholder.svg -resize 192x192 pwa-192x192.png
convert pwa-icon-placeholder.svg -resize 512x512 pwa-512x512.png
# ... etc
```

## 🎯 Design Recommendations

- **Background**: Gradient from #6366f1 to #8b5cf6
- **Icon**: White target/bullseye or checkmark
- **Text**: "HabitAlgo" in modern sans-serif font
- **Safe Area**: Keep important elements within 80% of canvas
- **Maskable**: Ensure design works with circular masks

## 📱 Testing

After generating icons:
1. Restart the dev server: `npm run dev`
2. Open browser DevTools → Application → Manifest
3. Check all icons load correctly
4. Test PWA installation on mobile

## ✅ Verification

Run this in browser console:
```javascript
// Check if icons exist
fetch('/pwa-192x192.png').then(r => console.log('192px:', r.ok));
fetch('/pwa-512x512.png').then(r => console.log('512px:', r.ok));
```

---

**For detailed instructions, see:** `docs/PWA_ICONS_GUIDE.md`
