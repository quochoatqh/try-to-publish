import { app, BrowserWindow, ipcMain, dialog, nativeTheme, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Add this for debugging
    show: false
  });

  // Debug preload path

  if (isDev) {
    // Development mode: load from Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // Production mode: load from built files
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window after content loads
  win.once('ready-to-show', () => {
    win.show();
  });

  return win;
}

// IPC Handlers
function setupIpcHandlers() {
  // App info
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  // Window controls
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });

  // File operations
  ipcMain.handle('dialog:open-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('dialog:save-file', async (event, content) => {
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      const fs = await import('fs/promises');
      await fs.writeFile(result.filePath, content);
      return true;
    }
    return false;
  });

  // Theme
  ipcMain.handle('theme:set', (event, theme) => {
    nativeTheme.themeSource = theme;
  });

  ipcMain.handle('theme:get', () => {
    return nativeTheme.themeSource;
  });

  // Notifications
  ipcMain.handle('notification:show', (event, title, body) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });


}

// Auto-updater setup
function setupAutoUpdater() {
  // Configure auto-updater
  autoUpdater.checkForUpdatesAndNotify();

  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    // Show notification to user
    if (Notification.isSupported()) {
      new Notification({
        title: 'Update Available',
        body: `Version ${info.version} is available. Downloading...`
      }).show();
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info.version);
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    // Show notification and prompt user to restart
    if (Notification.isSupported()) {
      new Notification({
        title: 'Update Ready',
        body: `Version ${info.version} has been downloaded. Restart to apply.`
      }).show();
    }

    // Auto-restart after 5 seconds (optional)
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  // Setup auto-updater (only in production)
  if (!isDev) {
    setupAutoUpdater();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
