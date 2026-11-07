const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { registerIpc } = require("./ipc/channels");

app.setName("pdv-restaurante");

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

function dataDir() {
  return path.join(app.getPath("appData"), "pdv-restaurante");
}

function ensureLocalFiles() {
  const root = dataDir();
  for (const folder of ["fiscal/certs", "fiscal/secrets", "fiscal/xml", "logs"]) {
    fs.mkdirSync(path.join(root, folder), { recursive: true });
  }
  const terminalFile = path.join(root, "terminal.json");
  if (!fs.existsSync(terminalFile)) {
    const terminal = {
      machineKey: randomUUID(),
      name: require("os").hostname(),
    };
    fs.writeFileSync(terminalFile, JSON.stringify(terminal, null, 2));
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: "#f4f1ec",
    title: "PDV Restaurante",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  window.webContents.on("will-navigate", (event, url) => {
    const allowed =
      url.startsWith("http://127.0.0.1:5173") ||
      url.startsWith("http://localhost:5173");
    if (!allowed) event.preventDefault();
  });

  const startUrl = process.env.ELECTRON_START_URL || "http://127.0.0.1:5173";
  window.loadURL(startUrl);
}

if (gotLock) {
  app.whenReady().then(() => {
    ensureLocalFiles();
    registerIpc(ipcMain, {
      "app:version": () => app.getVersion(),
      "app:dataDir": () => dataDir(),
    });
    createWindow();
  });

  app.on("second-instance", () => {
    const [window] = BrowserWindow.getAllWindows();
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.focus();
  });

  app.on("window-all-closed", () => {
    app.quit();
  });
}
