const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');

let mainWindow;
let backendProcess = null;

const isDev = !app.isPackaged;

function killBackend() {
  if (backendProcess) {
    console.log('Killing backend process:', backendProcess.pid);
    if (process.platform === 'win32') {
      // Windows: Use taskkill to kill the process tree
      exec(`taskkill /pid ${backendProcess.pid} /T /F`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
    } else {
      // Unix-like
      backendProcess.kill();
    }
    backendProcess = null;
  }
}

function startBackend() {
  if (isDev) {
    // In development, run the python script directly
    // Assuming python is in the path or venv is activated
    // We use the full path to the python executable in the venv if possible, or just 'python'
    const backendPath = path.join(__dirname, '../../backend/main.py');
    console.log('Starting backend from:', backendPath);
    
    // You might need to adjust 'python' to your specific python executable path if needed
    // For Windows dev environment, we can try to use the venv python
    const venvPython = path.join(__dirname, '../../backend/venv/Scripts/python.exe');
    const pythonExec = require('fs').existsSync(venvPython) ? venvPython : 'python';

    backendProcess = spawn(pythonExec, [backendPath]);
  } else {
    // In production, run the bundled executable
    // The executable will be in the resources folder
    const backendPath = path.join(process.resourcesPath, 'api.exe');
    console.log('Starting backend from:', backendPath);
    backendProcess = spawn(backendPath);
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  startBackend();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);

  // Open the DevTools when F12 is pressed
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: '选择文本文件',
    filters: [{ name: '文本文件', extensions: ['txt'] }],
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

app.on('ready', createWindow);

app.on('will-quit', () => {
  killBackend();
});

app.on('window-all-closed', function () {
  killBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
