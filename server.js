const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Download directory
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// Create downloads directory if it doesn't exist
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

// Download endpoint
app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
    }

    console.log(`Download request received for: ${url}`);

    // Check if it's a playlist
    const isPlaylist = url.includes('playlist?list=') || url.includes('&list=');

    // yt-dlp command for 320kbps MP3
    const command = `yt-dlp -x --audio-format mp3 --audio-quality 320K -o "${DOWNLOAD_DIR}/%(title)s.%(ext)s" "${url}"`;

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
            .slice(0, isPlaylist ? 50 : 1);

        res.json({ 
            success: true, 
            message: isPlaylist 
                ? `Successfully downloaded ${files.length} MP3 files to ${DOWNLOAD_DIR}`
                : `Successfully downloaded MP3 to ${DOWNLOAD_DIR}`,
            files: files,
            downloadDir: DOWNLOAD_DIR
        });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', downloadDir: DOWNLOAD_DIR });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎵 YouTube MP3 Downloader Server`);
    console.log(`================================`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Downloads will be saved to: ${DOWNLOAD_DIR}`);
    console.log(`\nMake sure you have installed:`);
    console.log(`  - yt-dlp (download from github.com/yt-dlp/yt-dlp/releases)`);
    console.log(`  - FFmpeg (download from ffmpeg.org)`);
    console.log(`\nReady to accept download requests!\n`);
});