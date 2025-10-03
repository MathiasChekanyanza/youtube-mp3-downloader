const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),
    openDownloadFolder: () => ipcRenderer.invoke('open-download-folder')
});
