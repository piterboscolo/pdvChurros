const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pdv", {
  version: () => ipcRenderer.invoke("app:version"),
  dataDir: () => ipcRenderer.invoke("app:dataDir"),
});
