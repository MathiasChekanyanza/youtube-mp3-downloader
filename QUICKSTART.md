# Quick Start Guide - Desktop Application

## 🚀 Run Your Desktop App NOW

### Option 1: Test in Development Mode (Recommended First)

```powershell
npm run electron
```

This opens the app in a window - perfect for testing!

### Option 2: Build Executable for Distribution

```powershell
npm run build:win
```

This creates an installer in the `dist` folder that you can share with others!

---

## 📦 What You Get

After building, you'll have TWO versions in the `dist` folder:

1. **Installer** (`YouTube MP3 Downloader Setup 1.0.0.exe`)
   - Professional installer with shortcuts
   - Installs to Program Files
   - Creates desktop icon

2. **Portable** (`YouTube MP3 Downloader 1.0.0.exe`)
   - No installation needed
   - Run from USB stick
   - Perfect for sharing

---

## 🎯 Key Features Added

✅ **Built-in Server** - No need to run `node server.js` separately!
✅ **Auto-start** - Everything loads automatically when you open the app
✅ **Downloads Folder** - Click "📁 Open Downloads" to see your files
✅ **Standalone** - Users don't need Node.js installed!

---

## 📁 Download Location

Files are saved to: `C:\Users\YourName\Downloads\YouTube-MP3\`

---

## 🔧 FFmpeg Required

Don't forget to install FFmpeg:
1. Download from: https://ffmpeg.org/download.html
2. Extract and add to PATH
3. Restart computer

---

## 🎨 Custom Icon (Optional)

To add a custom icon:
1. Find a nice icon (256x256 PNG)
2. Save as `icon.png` in project folder
3. Rebuild: `npm run build:win`

---

## ❓ Need Help?

Check the full README.md for detailed troubleshooting!

---

**That's it! Run `npm run electron` to test your app right now! 🎉**
