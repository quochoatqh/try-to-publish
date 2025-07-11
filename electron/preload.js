import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  
  // File operations (example)
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
  saveFile: (content) => ipcRenderer.invoke('dialog:save-file', content),
  
  // Theme
  setTheme: (theme) => ipcRenderer.invoke('theme:set', theme),
  getTheme: () => ipcRenderer.invoke('theme:get'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('notification:show', title, body),
});

// Remove this if you don't need it
console.log('Preload script loaded');
