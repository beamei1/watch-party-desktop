const { app, BrowserWindow, session, ipcMain } = require('electron'); // 👈 ลบ dialog ออก และเพิ่ม ipcMain
const { autoUpdater } = require('electron-updater');
const path = require('path'); // 👈 เพิ่ม path สำหรับเรียกใช้ preload.js

let win; // ประกาศตัวแปร win ไว้ด้านนอก เพื่อให้ดึงไปใช้ตอนส่งสัญญาณได้

function createWindow () {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Watch Party",
    icon: __dirname + '/icon.ico',
    autoHideMenuBar: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 👈 เพิ่มสะพานเชื่อมไปยังหน้าเว็บ
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // อนุญาตการใช้ไมโครโฟน
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') callback(true);
    else callback(false);
  });

  // 👈 โหลดหน้าเว็บ พร้อมกับแนบเลขเวอร์ชันของโปรแกรมไปให้เว็บรู้ด้วย
  win.loadURL('https://bpdow.vercel.app/?version=' + app.getVersion());

  // 🔥 ตั้งค่าให้อัปเดตและดาวน์โหลดแบบเงียบๆ เบื้องหลัง
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // 🔥 สั่งให้เช็คอัปเดตแบบเงียบๆ (ไม่ต้องใช้ Notify)
  win.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdates();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// 🚀 ระบบแจ้งเตือนอัปเดตไปยังหน้าเว็บ (UI ของเราเอง)
// ==========================================

// 🔥 เมื่อโหลดไฟล์อัปเดตเสร็จ 100% ให้ส่งสัญญาณบอกเว็บ (ไม่ต้องเด้ง Windows Dialog แล้ว)
autoUpdater.on('update-downloaded', () => {
  if (win) win.webContents.send('update_downloaded');
});

// 🔥 รอรับสัญญาณจากหน้าเว็บ (เมื่อผู้ใช้กดปุ่ม "อัปเดตเลย" ในหน้า UI ของเรา)
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});
