const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // รอรับสัญญาณจาก main.js ว่าโหลดอัปเดตเสร็จแล้ว
    onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
    // ส่งคำสั่งกลับไปให้ main.js ทำการติดตั้ง
    restartApp: () => ipcRenderer.send('restart_app')
});
