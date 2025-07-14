import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Declare global electronAPI
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      openFile: () => Promise<string | null>;
      saveFile: (content: string) => Promise<boolean>;
      setTheme: (theme: string) => Promise<void>;
      getTheme: () => Promise<string>;
      showNotification: (title: string, body: string) => Promise<void>;
      checkForUpdates: () => Promise<void>;
      installUpdate: () => Promise<void>;
      onUpdateAvailable: (callback: (event: any, info: any) => void) => void;
      onUpdateDownloaded: (callback: (event: any, info: any) => void) => void;
    };
  }
}

function App() {
  const [count, setCount] = useState(0)
  const [version, setVersion] = useState<string>('')
  const [updateStatus, setUpdateStatus] = useState<string>('No updates checked')

  const handleGetVersion = async () => {
    if (window.electronAPI) {
      const appVersion = await window.electronAPI.getVersion();
      setVersion(appVersion);
    }
  };

  const handleOpenFile = async () => {
    if (window.electronAPI) {
      const filePath = await window.electronAPI.openFile();
      if (filePath) {
        await window.electronAPI.showNotification('File Selected', `Selected: ${filePath}`);
      }
    }
  };

  const handleSaveFile = async () => {
    console.log(window.electronAPI, 'window.electronAPI')
    if (window.electronAPI) {
      const success = await window.electronAPI.saveFile(`Hello from Electron App!\nCount: ${count}`);
      if (success) {
        await window.electronAPI.showNotification('File Saved', 'File saved successfully!');
      }
    }
  };

  const handleCheckForUpdates = async () => {
    if (window.electronAPI) {
      setUpdateStatus('Checking for updates...');
      await window.electronAPI.checkForUpdates();
    }
  };

  const handleInstallUpdate = async () => {
    if (window.electronAPI) {
      await window.electronAPI.installUpdate();
    }
  };

  // Setup update listeners
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onUpdateAvailable((event, info) => {
        setUpdateStatus(`Update available: v${info.version}`);
      });

      window.electronAPI.onUpdateDownloaded((event, info) => {
        setUpdateStatus(`Update downloaded: v${info.version} - Ready to install`);
      });
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Electron</h1>

      {version && <p>App Version: {version}</p>}

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="card">
        <h3>Electron APIs Test</h3>
        <button onClick={handleGetVersion}>Get App Version</button>
        <button onClick={handleOpenFile}>Open File Dialog</button>
        <button onClick={handleSaveFile}>Save File</button>
        <button onClick={() => window.electronAPI?.minimize()}>Minimize Window</button>
        <button onClick={() => window.electronAPI?.showNotification('Test', 'Hello from Electron!')}>
          Show Notification
        </button>
      </div>

      <div className="card">
        <h3>Auto-Update</h3>
        <p>Status: {updateStatus}</p>
        <button onClick={handleCheckForUpdates}>Check for Updates</button>
        <button onClick={handleInstallUpdate}>Install Update</button>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
