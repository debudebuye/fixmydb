const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fixmydb', {
  start: (config) => ipcRenderer.invoke('start', config),
  stop: () => ipcRenderer.invoke('stop'),
  getStatus: () => ipcRenderer.invoke('get-status'),
});
