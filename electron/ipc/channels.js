const ALLOWED = new Set(["app:version", "app:dataDir"]);

function registerIpc(ipcMain, handlers) {
  for (const [channel, handler] of Object.entries(handlers)) {
    if (!ALLOWED.has(channel)) {
      throw new Error(`Canal IPC recusado: ${channel}`);
    }
    ipcMain.handle(channel, async () => handler());
  }
}

module.exports = { registerIpc, ALLOWED };
