# ⚠️ electron-builder Issue on Windows

## The Problem
When running `npm run build:win`, you get this error:
```
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
```

## Why This Happens
- **electron-builder** downloads code signing tools that include Mac libraries
- These Mac libraries use **symbolic links**
- Windows requires **Administrator privileges** to create symbolic links
- Even with the `CSC_IDENTITY_AUTO_DISCOVERY=false` flag, it still tries to download these tools

## ✅ Solution: Use electron-packager

Instead of `electron-builder`, we use **electron-packager** which:
- ✅ Doesn't require code signing tools
- ✅ No administrator privileges needed
- ✅ Works perfectly for local distribution
- ✅ Creates a portable app folder

### Build Command
```powershell
npm run package
```

This creates: `dist\YouTube MP3 Downloader-win32-x64\`

### Auto Build + ZIP
```powershell
.\build-and-package.ps1
```

This creates both the folder AND a ZIP file for easy sharing!

---

## Alternative Solutions (If You Still Want electron-builder)

### Option 1: Run PowerShell as Administrator
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Navigate to project folder
4. Run `npm run build:win`

### Option 2: Enable Developer Mode (Windows 10/11)
1. Open Settings
2. Go to "Update & Security" → "For developers"
3. Enable "Developer Mode"
4. Restart computer
5. Try building again

### Option 3: Clear Cache and Retry
```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache"
npm run build:win
```

---

## Recommendation

**Stick with `electron-packager`** (`npm run package`) because:
- ✅ Simpler and faster
- ✅ No permission issues
- ✅ Perfect for distribution
- ✅ No code signing needed for personal projects

Only use `electron-builder` if you need:
- Code signing for SmartScreen
- Auto-updates functionality
- Windows Store distribution
- Complex installer customization

---

## 📦 Distribution

The `electron-packager` output can be distributed by:
1. **ZIP the folder** - Users extract and run
2. **Create installer with Inno Setup** - Professional setup wizard
3. **Share folder directly** - For local use

All methods work great! 🎉
