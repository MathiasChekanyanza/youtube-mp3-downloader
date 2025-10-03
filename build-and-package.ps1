# Build and Package Script for YouTube MP3 Downloader

Write-Host "🎵 YouTube MP3 Downloader - Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean old builds
Write-Host "🧹 Cleaning old builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist\YouTube MP3 Downloader-win32-x64" -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned old builds" -ForegroundColor Green
}

# Step 2: Build the application
Write-Host ""
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run package

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful!" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Create ZIP for distribution
Write-Host ""
Write-Host "🗜️ Creating distribution ZIP..." -ForegroundColor Yellow

$sourcePath = ".\dist\YouTube MP3 Downloader-win32-x64"
$zipPath = ".\dist\YouTube-MP3-Downloader-v1.0.0.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path $sourcePath -DestinationPath $zipPath -CompressionLevel Optimal

if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "✓ ZIP created successfully!" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Gray
    Write-Host "  Location: $zipPath" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create ZIP" -ForegroundColor Red
    exit 1
}

# Step 4: Summary
Write-Host ""
Write-Host "🎉 Build Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Application folder: .\dist\YouTube MP3 Downloader-win32-x64\" -ForegroundColor Cyan
Write-Host "📦 Distribution ZIP:   .\dist\YouTube-MP3-Downloader-v1.0.0.zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the app, run:" -ForegroundColor Yellow
Write-Host '  Start-Process ".\dist\YouTube MP3 Downloader-win32-x64\YouTube MP3 Downloader.exe"' -ForegroundColor Gray
Write-Host ""
Write-Host "To share with others:" -ForegroundColor Yellow
Write-Host "  1. Share the ZIP file" -ForegroundColor Gray
Write-Host "  2. Users extract and run YouTube MP3 Downloader.exe" -ForegroundColor Gray
Write-Host "  3. That's it! 🚀" -ForegroundColor Gray
Write-Host ""
