import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

// Declare global electronAPI
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      openFile: () => Promise<string | null>;
      saveFile: (
        content: string
      ) => Promise<boolean>;
      setTheme: (theme: string) => Promise<void>;
      getTheme: () => Promise<string>;
      showNotification: (
        title: string,
        body: string
      ) => Promise<void>;
      checkForUpdates: () => Promise<void>;
      installUpdate: () => Promise<void>;
      onUpdateChecking: (
        callback: () => void
      ) => void;
      onUpdateAvailable: (
        callback: (event: any, info: any) => void
      ) => void;
      onUpdateNotAvailable: (
        callback: (event: any, info: any) => void
      ) => void;
      onUpdateError: (
        callback: (
          event: any,
          error: string
        ) => void
      ) => void;
      onUpdateProgress: (
        callback: (
          event: any,
          progress: any
        ) => void
      ) => void;
      onUpdateDownloaded: (
        callback: (event: any, info: any) => void
      ) => void;
      onUpdateManualCheck: (
        callback: (event: any, data: any) => void
      ) => void;
    };
  }
}

function App() {
  const [count, setCount] = useState(0);
  const [version, setVersion] =
    useState<string>("");
  const [updateStatus, setUpdateStatus] =
    useState<string>("No updates checked");

  const handleGetVersion = async () => {
    if (window.electronAPI) {
      const appVersion =
        await window.electronAPI.getVersion();
      setVersion(appVersion);
    }
  };

  const handleOpenFile = async () => {
    if (window.electronAPI) {
      const filePath =
        await window.electronAPI.openFile();
      if (filePath) {
        await window.electronAPI.showNotification(
          "File Selected",
          `Selected: ${filePath}`
        );
      }
    }
  };

  const handleSaveFile = async () => {
    console.log(
      window.electronAPI,
      "window.electronAPI"
    );
    if (window.electronAPI) {
      const success =
        await window.electronAPI.saveFile(
          `Hello from Electron App!\nCount: ${count}`
        );
      if (success) {
        await window.electronAPI.showNotification(
          "File Saved",
          "File saved successfully!"
        );
      }
    }
  };

  const handleCheckForUpdates = async () => {
    console.log(
      "🔄 Check for updates button clicked"
    );
    if (window.electronAPI) {
      console.log(
        "📡 Calling electronAPI.checkForUpdates()"
      );
      setUpdateStatus("Checking for updates...");
      await window.electronAPI.checkForUpdates();
      console.log(
        "✅ checkForUpdates call completed"
      );
    } else {
      console.log("❌ electronAPI not available");
    }
  };

  const handleInstallUpdate = async () => {
    if (window.electronAPI) {
      await window.electronAPI.installUpdate();
    }
  };

  // Setup update listeners
  useEffect(() => {
    console.log(
      "🎧 Setting up update event listeners"
    );
    if (window.electronAPI) {
      window.electronAPI.onUpdateChecking(() => {
        console.log(
          "📡 Received: update-checking"
        );
        setUpdateStatus(
          "Checking for updates..."
        );
      });

      window.electronAPI.onUpdateAvailable(
        (event, info) => {
          console.log(
            "✅ Received: update-available",
            info
          );
          setUpdateStatus(
            `Update available: v${info.version} - Downloading...`
          );
        }
      );

      window.electronAPI.onUpdateNotAvailable(
        () => {
          console.log(
            "❌ Received: update-not-available"
          );
          setUpdateStatus("No updates available");
        }
      );

      window.electronAPI.onUpdateError(
        (event, error) => {
          console.log(
            "💥 Received: update-error",
            error
          );
          setUpdateStatus(
            `Update error: ${error}`
          );
        }
      );

      window.electronAPI.onUpdateProgress(
        (event, progress) => {
          console.log(
            "📊 Received: update-progress",
            progress.percent
          );
          setUpdateStatus(
            `Downloading: ${Math.round(
              progress.percent
            )}%`
          );
        }
      );

      window.electronAPI.onUpdateDownloaded(
        (event, info) => {
          console.log(
            "📦 Received: update-downloaded",
            info
          );
          setUpdateStatus(
            `Update downloaded: v${info.version} - Ready to install`
          );
        }
      );

      window.electronAPI.onUpdateManualCheck(
        (event, data) => {
          console.log(
            "🔗 Received: update-manual-check",
            data
          );
          setUpdateStatus(
            `${data.message} Click here: ${data.url}`
          );
        }
      );
    } else {
      console.log(
        "❌ electronAPI not available for event listeners"
      );
    }
  }, []);

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center">
        <a
          href="https://vite.dev"
          target="_blank"
        >
          <img
            src={viteLogo}
            className="logo"
            alt="Vite logo"
          />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
        >
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>Vite + React + Electron</h1>

      {version && <p>App Version: {version}</p>}

      <div className="card">
        <button
          onClick={() =>
            setCount((count) => count + 1)
          }
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save
          to test HMR
        </p>
      </div>

      <div className="card">
        <h3>Electron APIs Test</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={handleGetVersion}>
            Get App Version
          </button>
          <button onClick={handleOpenFile}>
            Open File Dialog
          </button>
          <button onClick={handleSaveFile}>
            Save File
          </button>
          <button
            onClick={() =>
              window.electronAPI?.minimize()
            }
          >
            Minimize Window
          </button>
          <button
            onClick={() =>
              window.electronAPI?.showNotification(
                "Test",
                "Hello from Electron!"
              )
            }
          >
            Show Notification
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Auto-Update</h3>
        <p>Status: {updateStatus}</p>
        <div className="flex gap-2 justify-center">
          <button onClick={handleCheckForUpdates}>
            Check for Updates
          </button>
          <button onClick={handleInstallUpdate}>
            Install Update
          </button>
        </div>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn
        more
      </p>
    </>
  );
}

export default App;
