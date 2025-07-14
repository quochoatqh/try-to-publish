import { app, BrowserWindow, ipcMain, dialog, nativeTheme, Notification } from 'electron';
// Auto-updater will be added later
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
    console.log('Loading from Vite dev server...');
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();

    // Debug load events
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
    });

    win.webContents.on('did-finish-load', () => {
      console.log('Page loaded successfully');
    });
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

// Auto-updater setup - Temporarily disabled
// async function setupAutoUpdater() {
//   // Will be implemented later
// }

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  // Auto-updater temporarily disabled
  // Will be re-enabled after fixing import issues
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
