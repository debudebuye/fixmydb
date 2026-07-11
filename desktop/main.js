const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let backendProcess = null;
let frontendProcess = null;
let currentBackendPort = 5001;
let currentFrontendPort = 3000;

function getBackendDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend');
  }
  return path.join(__dirname, '..', 'backend');
}

function getFrontendDistDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'frontend');
  }
  return path.join(__dirname, '..', 'frontend', 'dist');
}

function getServeScript() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'scripts', 'serve-frontend.js');
  }
  return path.join(__dirname, 'scripts', 'serve-frontend.js');
}

function getIconPath() {
  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'icons', iconName);
  }
  return path.join(__dirname, 'icons', iconName);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 540,
    resizable: false,
    title: 'FixMyDB Desktop',
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function startBackend(backendPort) {
  return new Promise((resolve, reject) => {
    const dataPath = path.join(app.getPath('userData'), 'data');
    const env = {
      PATH: process.env.PATH,
      NODE_ENV: 'production',
      PORT: String(backendPort),
      AUTO_OPEN: 'false',
      FIXMYDB_DATA_PATH: dataPath,
    };
    if (process.env.APPDATA) env.APPDATA = process.env.APPDATA;
    backendProcess = spawn('node', ['src/index.js'], {
      cwd: getBackendDir(),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderrLog = '';
    let started = false;
    backendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log('[backend]', msg);
      if (!started && msg.includes('running on http')) {
        started = true;
        resolve();
      }
    });
    backendProcess.stderr.on('data', (data) => {
      stderrLog += data.toString();
      console.error('[backend err]', data.toString());
    });
    backendProcess.on('error', (err) => {
      console.error('[backend spawn error]', err);
      reject(new Error(`Failed to start backend: ${err.message}`));
    });
    backendProcess.on('exit', (code) => {
      backendProcess = null;
      if (!started) {
        const detail = stderrLog ? ` - stderr: ${stderrLog}` : '';
        reject(new Error(`Backend exited with code ${code}${detail}`));
      }
    });
    setTimeout(() => {
      if (!started) {
        started = true;
        resolve();
      }
    }, 5000);
  });
}

function startFrontend(frontendPort, backendPort) {
  return new Promise((resolve, reject) => {
    const env = {
      PATH: process.env.PATH,
    };
    frontendProcess = spawn('node', [
      getServeScript(),
      '--port', String(frontendPort),
      '--api-url', `http://localhost:${backendPort}`,
      '--dir', getFrontendDistDir(),
    ], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let started = false;
    frontendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log('[frontend]', msg);
      if (!started && msg.includes('Frontend server running')) {
        started = true;
        resolve();
      }
    });
    frontendProcess.stderr.on('data', (data) => {
      console.error('[frontend err]', data.toString());
    });
    frontendProcess.on('error', reject);
    frontendProcess.on('exit', (code) => {
      frontendProcess = null;
      if (!started) reject(new Error(`Frontend exited with code ${code}`));
    });
    setTimeout(() => {
      if (!started) {
        started = true;
        resolve();
      }
    }, 5000);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

function stopFrontend() {
  if (frontendProcess) {
    frontendProcess.kill();
    frontendProcess = null;
  }
}

function stopAll() {
  stopBackend();
  stopFrontend();
}

// IPC handlers
ipcMain.handle('start', async (event, { backendPort, frontendPort }) => {
  try {
    const distDir = getFrontendDistDir();
    const fs = require('fs');
    if (!fs.existsSync(path.join(distDir, 'index.html'))) {
      return { success: false, error: 'Frontend not built. Run "cd frontend && npm run build" first, or use npm run build-frontend from desktop folder.' };
    }
    currentBackendPort = backendPort;
    currentFrontendPort = frontendPort;
    await startBackend(backendPort);
    await startFrontend(frontendPort, backendPort);
    return { success: true, frontendUrl: `http://localhost:${frontendPort}` };
  } catch (err) {
    stopAll();
    return { success: false, error: err.message };
  }
});

ipcMain.handle('stop', () => {
  stopAll();
  return { success: true };
});

ipcMain.handle('get-status', () => {
  return {
    backendRunning: backendProcess !== null && backendProcess.exitCode === null,
    frontendRunning: frontendProcess !== null && frontendProcess.exitCode === null,
    backendPort: currentBackendPort,
    frontendPort: currentFrontendPort,
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopAll();
  app.quit();
});

app.on('before-quit', () => {
  stopAll();
});
