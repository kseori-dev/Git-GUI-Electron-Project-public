/*
preload.ts fungiert als sichere Brücke zwischen dem Main-Prozess von Electron
und dem Renderer-Prozess (React UI).

Über den `contextBridge` werden ausschließlich explizit definierte Funktionen
im globalen `window`-Objekt verfügbar gemacht. Dadurch wird der direkte Zugriff
des Renderer-Prozesses auf Node.js-APIs verhindert und das Sicherheitsmodell von
Electron eingehalten.

Das hier exponierte `window.git`-API kapselt sämtliche Git-bezogenen Operationen
und kommuniziert über IPC* mit dem Main-Prozess.
Die eigentliche Git-Logik wird dabei nicht im Renderer ausgeführt.

*IPC (`ipcRenderer.invoke`) - Electron-API zur bidirektionalen Kommunikation zwischen Renderer-
und Hauptprozess ohne dass der Renderer direkten Zugriff auf die Git-Logik hat.

Zusätzlich stellt `preload.ts` ein minimales, typisiertes IPC-Hilfs-API
(`window.electron`) bereit, um eine kontrollierte Kommunikation mit dem
Main-Prozess zu ermöglichen. 

Das `window.git`-Objekt stellt eine klar definierte Schnittstelle für Git-Operationen
bereit, wie z.B. Commit-Historie, Branch-Verwaltung, Merges und Repository-Auswahl.
Alle Methoden geben Promises zurück und nutzen ausschließlich asynchrone IPC-Aufrufe.
*/

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

// commit history
contextBridge.exposeInMainWorld('git', {
  getCommits: () => ipcRenderer.invoke('git:getCommits'), 

// create new branch
  createBranch: (name: string) => ipcRenderer.invoke('git:createBranch', name), 

// commit all changes with a message
  commitAll: (message: string) => ipcRenderer.invoke('git:commitAll', message), 

// push current branch to GitHub
  pushBranch: () => ipcRenderer.invoke('git:pushBranch'), 

// get list of all local branches
  getBranches: () => ipcRenderer.invoke('git:getBranches'), 

// get the name of the current branch                 
  getCurrentBranch: () => ipcRenderer.invoke('git:getCurrentBranch'), 
// checkout a branch
  checkoutBranch: (branch: string) =>
    ipcRenderer.invoke('git:checkoutBranch', branch), 

// merge source branch into target branch
  mergeBranch: (source: string, target: string) =>
    ipcRenderer.invoke('git:mergeBranch', source, target), 

// set the current repository path in the main process
  setRepoPath: (repoPath: string) =>
    ipcRenderer.invoke('git:setRepoPath', repoPath),
  
  // set the current repository path in the main process
  setRepo: (path: string) => ipcRenderer.invoke('git:setRepo', path), 

// open a dialog to select a repository and return its path
  selectRepo: () => ipcRenderer.invoke('git:selectRepo'), 

// get the current repository path from the main process
  getRepoPath: () => ipcRenderer.invoke('git:getRepoPath'), 
});

// For ipcRenderer in the renderer process
const electronHandler = { 
  ipcRenderer: {

    // send a message to the main process
    sendMessage(channel: Channels, ...args: unknown[]) { 
      ipcRenderer.send(channel, ...args);
    },

    // listen for messages from the main process
    on(channel: Channels, func: (...args: unknown[]) => void) { 
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

// cleanup the listener when the component unmounts
      return () => {
        ipcRenderer.removeListener(channel, subscription); 
      };
    },
    
    // listen for a single message from the main process
    once(channel: Channels, func: (...args: unknown[]) => void) { 
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

// Expose the electronHandler to the renderer process
contextBridge.exposeInMainWorld('electron', electronHandler); 

// Export the type for use in the renderer process
export type ElectronHandler = typeof electronHandler; 
