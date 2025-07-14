import { app, BrowserWindow, ipcMain, dialog, nativeTheme, Notification } from 'electron';
// Auto-updater will be dynamically imported
let autoUpdaterInstance = null;
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

  // Auto-updater IPC handlers
  ipcMain.handle('updater:check-for-updates', async (event) => {
    console.log('🔄 Check for updates called, isDev:', isDev);

    if (!isDev) {
      try {
        console.log('📦 Production mode - using real auto-updater');
        const autoUpdater = await getAutoUpdater();

        if (!autoUpdater) {
          event.sender.send('update-error', 'Failed to initialize auto-updater');
          return;
        }

        // Setup one-time event listeners for this check
        const setupEventForwarding = () => {
          autoUpdater.once('checking-for-update', () => {
            console.log('📡 Checking for update...');
            event.sender.send('update-checking');
          });

          autoUpdater.once('update-available', (info) => {
            console.log('✅ Update available:', info.version);
            event.sender.send('update-available', info);
          });

          autoUpdater.once('update-not-available', (info) => {
            console.log('❌ No update available:', info.version);
            event.sender.send('update-not-available', info);
          });

          autoUpdater.once('error', (err) => {
            console.log('💥 Update error:', err.message);
            event.sender.send('update-error', err.message);
          });
        };

        setupEventForwarding();
        autoUpdater.checkForUpdatesAndNotify();
      } catch (error) {
        console.error('Failed to check for updates:', error);
        event.sender.send('update-error', error.message);
      }
    } else {
      // Development mode - simulate no updates
      console.log('🛠️ Development mode - simulating update check');

      // First send checking event
      event.sender.send('update-checking');

      // Then simulate result after delay
      setTimeout(() => {
        console.log('📝 Sending simulated update-not-available');
        event.sender.send('update-not-available', { version: '1.0.3' });
      }, 2000);
    }
  });

  ipcMain.handle('updater:install-update', async () => {
    if (!isDev) {
      try {
        const autoUpdater = await getAutoUpdater();
        if (autoUpdater) {
          autoUpdater.quitAndInstall();
        }
      } catch (error) {
        console.error('Failed to install update:', error);
      }
    }
  });
}

// Get or initialize autoUpdater instance
async function getAutoUpdater() {
  if (!autoUpdaterInstance) {
    try {
      const { autoUpdater } = await import('electron-updater');
      autoUpdaterInstance = autoUpdater;
      console.log('✅ AutoUpdater instance created');
    } catch (error) {
      console.error('❌ Failed to import electron-updater:', error);
      return null;
    }
  }
  return autoUpdaterInstance;
}

// Auto-updater setup
async function setupAutoUpdater() {
  try {
    // Get shared autoUpdater instance
    const autoUpdater = await getAutoUpdater();
    if (!autoUpdater) {
      console.error('❌ Failed to get autoUpdater instance');
      return null;
    }

    console.log('Auto-updater initialized');

    // Configure auto-updater
    autoUpdater.checkForUpdatesAndNotify();

    // Auto-updater events with renderer forwarding
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
      // Forward to renderer
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-checking');
      });
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      // Forward to renderer
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-available', info);
      });
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
      // Forward to renderer
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-not-available', info);
      });
    });

    autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
      // Forward to renderer
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-error', err.message);
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      console.log(log_message);
      // Forward to renderer
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-progress', progressObj);
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info.version);
      // Forward to renderer
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('update-downloaded', info);
      });
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

    return autoUpdater;

  } catch (error) {
    console.error('Failed to setup auto-updater:', error);
    return null;
  }
}

app.whenReady().then(async () => {
  setupIpcHandlers();
  createWindow();

  // Setup auto-updater (only in production)
  if (!isDev) {
    await setupAutoUpdater();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
