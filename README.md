# YouTube MP3 Downloader - Desktop Application

A beautiful desktop application for downloading high-quality MP3 files from YouTube videos and playlists.

## Features

- 🎵 Download YouTube videos as MP3 (256 kbps or 320 kbps)
- 📋 Support for entire playlists
- 🔍 Automatic preview when pasting YouTube links
- 💻 Cross-platform desktop application (Windows, Mac, Linux)
- ⚡ Fast and efficient downloads
- 📁 Downloads saved to your Downloads folder

## Prerequisites

Before building/running the application, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **yt-dlp.exe** - Already included in the project
3. **FFmpeg** - [Download here](https://ffmpeg.org/download.html)
   - Make sure FFmpeg is added to your system PATH

## Installation & Setup

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install both the runtime dependencies and development tools (Electron and Electron Builder).

### 2. Run in Development Mode

To test the application before building:

```powershell
npm run electron
```

Or with logging enabled:

```powershell
npm run electron-dev
```

### 3. Build the Desktop Application

#### For Windows (Installer + Portable):
```powershell
npm run build:win
```

This creates:
- An NSIS installer (`.exe`) in the `dist` folder
- A portable version that doesn't require installation

#### For Mac:
```powershell
npm run build:mac
```

#### For Linux:
```powershell
npm run build:linux
```

#### For All Platforms:
```powershell
npm run build
```

## Distribution

After building, you'll find your application in the `dist` folder:

- **Windows**: `YouTube MP3 Downloader Setup 1.0.0.exe` (installer) or portable `.exe`
- **Mac**: `YouTube MP3 Downloader-1.0.0.dmg`
- **Linux**: `YouTube-MP3-Downloader-1.0.0.AppImage` or `.deb` package

You can distribute these files to users - they don't need Node.js or npm installed!

## File Structure

```
youtube-mp3-downloader/
├── main.js              # Electron main process (server + window)
├── preload.js           # Electron preload script (security)
├── index.html           # Application UI
├── server.js            # Original standalone server (optional)
├── yt-dlp.exe          # YouTube downloader executable
├── package.json         # Project configuration
├── icon.png            # Application icon (add your own)
└── dist/               # Built applications (created after build)
```

## Usage

1. **Launch the application**
2. **Paste a YouTube URL** - Preview appears automatically
3. **Select audio quality** (256 kbps or 320 kbps)
4. **Check/uncheck playlist option** if it's a playlist URL
5. **Click "Download MP3"**
6. **Files are saved to**: `Downloads/YouTube-MP3/`

## Customization

### Change the App Icon

1. Create or download an icon (PNG format, 256x256 or larger)
2. Save it as `icon.png` in the project root
3. Rebuild the application

### Change Download Location

The app automatically saves to `Downloads/YouTube-MP3/`. To change this, edit `main.js`:

```javascript
const DOWNLOAD_DIR = path.join(app.getPath('downloads'), 'YouTube-MP3');
```

## Troubleshooting

### "yt-dlp is not recognized"
- Make sure `yt-dlp.exe` is in the project folder
- The app uses the bundled `yt-dlp.exe` automatically

### "FFmpeg not found"
- Download FFmpeg from https://ffmpeg.org/download.html
- Add FFmpeg to your system PATH
- Restart the application

### Build Errors
- Make sure you have the latest Node.js version
- Delete `node_modules` and run `npm install` again
- On Windows, you may need Windows Build Tools: `npm install --global windows-build-tools`

## Development

To run the standalone server (without Electron):

```powershell
npm start
```

Then open `index.html` in your browser at `http://localhost:3000`

## License

ISC License - Free to use and modify

## Author

Mathias Chekanyanza

---

Made with ❤️ using Electron, Express, and yt-dlp
