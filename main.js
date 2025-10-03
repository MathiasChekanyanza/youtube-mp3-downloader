const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverApp;
let server;
const PORT = 3000;

// Download directory
const DOWNLOAD_DIR = path.join(app.getPath('downloads'), 'YouTube-MP3');

// Create downloads directory if it doesn't exist
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Initialize Express server
function initializeServer() {
    serverApp = express();
    serverApp.use(cors());
    serverApp.use(express.json());

    // Download endpoint
    serverApp.post('/download', async (req, res) => {
        const { url, allowPlaylist, bitrate } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }

        // Default to 320K if bitrate not specified
        const audioBitrate = bitrate || '320K';

        console.log(`Download request received for: ${url} (${audioBitrate})`);

        // Check if it's a playlist by URL
        const isPlaylistUrl = url.includes('playlist?list=') || url.includes('&list=');

        // Respect client preference for playlist handling
        const playlistFlag = allowPlaylist ? '--yes-playlist' : '--no-playlist';

        // yt-dlp command with configurable bitrate
        const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
        const command = `"${ytDlpPath}" ${playlistFlag} -x --audio-format mp3 --audio-quality ${audioBitrate} -o "${DOWNLOAD_DIR}/%(title)s.%(ext)s" "${url}"`;

        console.log(`Executing: ${command}`);

        exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).json({ 
                    success: false, 
                    error: `Download failed: ${error.message}` 
                });
            }

            if (stderr && !stdout) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).json({ 
                    success: false, 
                    error: `Download failed: ${stderr}` 
                });
            }

            console.log('Download completed successfully');
            console.log(stdout);

            // Get list of downloaded files
            const files = fs.readdirSync(DOWNLOAD_DIR)
                .filter(file => file.endsWith('.mp3'))
                .sort((a, b) => {
                    const statA = fs.statSync(path.join(DOWNLOAD_DIR, a));
                    const statB = fs.statSync(path.join(DOWNLOAD_DIR, b));
                    return statB.mtime - statA.mtime;
                })
                .slice(0, isPlaylistUrl && allowPlaylist ? 50 : 1);

            res.json({ 
                success: true, 
                message: (isPlaylistUrl && allowPlaylist)
                    ? `Successfully downloaded ${files.length} MP3 files to ${DOWNLOAD_DIR}`
                    : `Successfully downloaded MP3 to ${DOWNLOAD_DIR}`,
                files: files,
                downloadDir: DOWNLOAD_DIR
            });
        });
    });

    // Preview endpoint to fetch metadata for video or playlist
    serverApp.post('/preview', async (req, res) => {
        const { url, allowPlaylist } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }

        const playlistFlag = allowPlaylist ? '--yes-playlist' : '--no-playlist';
        const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
        const command = `"${ytDlpPath}" ${playlistFlag} -J "${url}"`;

        exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Preview error: ${error.message}`);
                return res.status(500).json({ success: false, error: `Preview failed: ${error.message}` });
            }

            try {
                const info = JSON.parse(stdout);

                // If playlist, normalize summary with entries
                if (info && (info._type === 'playlist' || Array.isArray(info.entries))) {
                    const entries = (info.entries || []).map((e, idx) => ({
                        index: (e.playlist_index || idx + 1),
                        id: e.id,
                        title: e.title,
                        duration: e.duration,
                        uploader: e.uploader || e.channel,
                        thumbnail: e.thumbnail
                    }));

                    return res.json({
                        success: true,
                        type: 'playlist',
                        title: info.title,
                        uploader: info.uploader || info.channel,
                        entryCount: entries.length,
                        entriesPreview: entries.slice(0, 15),
                    });
                }

                // Single video
                const data = {
                    success: true,
                    type: 'video',
                    id: info.id,
                    title: info.title,
                    uploader: info.uploader || info.channel,
                    duration: info.duration,
                    thumbnail: info.thumbnail
                };

                return res.json(data);
            } catch (parseError) {
                console.error('Failed to parse yt-dlp JSON:', parseError);
                return res.status(500).json({ success: false, error: 'Failed to parse preview info' });
            }
        });
    });

    // Health check endpoint
    serverApp.get('/health', (req, res) => {
        res.json({ status: 'Server is running', downloadDir: DOWNLOAD_DIR });
    });

    // Start server
    server = serverApp.listen(PORT, () => {
        console.log(`\n🎵 YouTube MP3 Downloader Server`);
        console.log(`================================`);
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Downloads will be saved to: ${DOWNLOAD_DIR}`);
        console.log(`\nReady to accept download requests!\n`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.png'), // Add your app icon here
        autoHideMenuBar: true,
        title: 'YouTube MP3 Downloader'
    });

    // Load the index.html
    mainWindow.loadFile('index.html');

    // Open DevTools in development (comment out for production)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// IPC handlers
ipcMain.handle('select-download-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0];
});

ipcMain.handle('open-download-folder', () => {
    const { shell } = require('electron');
    shell.openPath(DOWNLOAD_DIR);
});

// App lifecycle
app.whenReady().then(() => {
    initializeServer();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (server) {
        server.close();
    }
});
