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
    // If allowPlaylist is true, download full playlist when URL is a playlist
    // If false, force single video even for playlist URLs
    const playlistFlag = allowPlaylist ? '--yes-playlist' : '--no-playlist';

    // yt-dlp command with configurable bitrate
    const command = `yt-dlp ${playlistFlag} -x --audio-format mp3 --audio-quality ${audioBitrate} -o "${DOWNLOAD_DIR}/%(title)s.%(ext)s" "${url}"`;

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
app.post('/preview', async (req, res) => {
    const { url, allowPlaylist } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const playlistFlag = allowPlaylist ? '--yes-playlist' : '--no-playlist';
    // -J outputs JSON metadata without downloading
    const command = `yt-dlp ${playlistFlag} -J "${url}"`;

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