// Type definitions for Electron API
export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>;
  
  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  
  // File operations
  openFile: () => Promise<string | null>;
  saveFile: (content: string) => Promise<boolean>;
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  getTheme: () => Promise<'light' | 'dark' | 'system'>;
  
  // Notifications
  showNotification: (title: string, body: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
