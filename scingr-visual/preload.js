const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("scingr", { now: () => new Date().toISOString() });
