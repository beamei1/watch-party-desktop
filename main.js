const { app, BrowserWindow, session, dialog } = require('electron');
const { autoUpdater } = require('electron-updater'); // เพิ่มบรรทัดนี้

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Watch Party",
    icon: __dirname + '/icon.ico',
    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') callback(true);
    else callback(false);
  });

  win.loadURL('https://bpdow.vercel.app');

  // 🔥 สั่งให้เช็คอัปเดตเมื่อเปิดหน้าต่างเสร็จ
  win.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 🔥 เมื่อโหลดไฟล์อัปเดตเสร็จ ให้เด้งหน้าต่างถามผู้ใช้
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'อัปเดตโปรแกรม',
    message: 'มีเวอร์ชันใหม่โหลดเสร็จแล้ว โปรแกรมจะปิดและเปิดใหม่เพื่อติดตั้งอัปเดตทันที',
    buttons: ['อัปเดตเลย']
  }).then(() => {
    setImmediate(() => autoUpdater.quitAndInstall());
  });
});
