// ============================================
// FallenShinobi-Voice — Electron Main
// Lance le serveur Node.js + ouvre la fenêtre app
// ============================================

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Lance le serveur en arrière-plan
require('./server.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    title: 'FallenShinobi Voice',
    backgroundColor: '#0a0a0f',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Pas de frame native pour look custom (optionnel)
    // frame: false,
  });

  // Attendre que le serveur soit prêt puis charger l'app
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 1000);

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
