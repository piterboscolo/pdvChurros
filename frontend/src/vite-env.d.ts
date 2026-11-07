/// <reference types="vite/client" />

interface PdvBridge {
  version: () => Promise<string>;
  dataDir: () => Promise<string>;
}

interface Window {
  pdv?: PdvBridge;
}
