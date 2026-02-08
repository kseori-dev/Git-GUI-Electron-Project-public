/* eslint global-require: off, no-console: off, promise/always-return: off 
 
  main.ts stellt den Einstiegspunkt des Main-Prozesses dar und ist
  verantwortlich für:
 
  - die Erstellung und Verwaltung des Hauptfensters (BrowserWindow)
  - die Initialisierung des Application-Lifecycles von Electron
  - die sichere Kommunikation mit dem Renderer-Prozess über IPC
  - die Ausführung von systemnaher Logik (z.B. Git-Kommandos)
 
  Git-bezogene Operationen werden über IPC-Handler bereitgestellt und an den
  GitService delegiert, welcher intern das native Git-CLI über Node.js nutzt.
 
  Der Renderer-Prozess (React UI) hat keinen direkten Zugriff auf Node.js-APIs,
  sondern kommuniziert ausschließlich über definierte IPC-Schnittstellen.
 
  Teile dieses Dokuments (z.B. Auto-Updater, Debug-Tools, Menü-Logik) stammen
  aus dem verwendeten Electron-React-Boilerplate und sind optional bzw.
  nicht Teil des aktuellen MVP.
  
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import * as git from './GitService';
import {dialog} from 'electron';
import fs from 'fs'; 

let currentRepoPath: string | null = null;

ipcMain.handle('git:setRepo', async (_, path: string) => {
  git.setRepo(path);
});

ipcMain.handle('git:selectRepo', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  
  const repoPath = result.filePaths[0];
  const gitDir = path.join(repoPath, '.git');

  if (!fs.existsSync(gitDir)) {
    throw new Error('Selected directory is not a Git repository');  
  }

  currentRepoPath = repoPath;
  return repoPath;  
});

ipcMain.handle('git:getRepoPath', () => currentRepoPath);

ipcMain.handle('git:getCommits', async () => {
  return git.getCommits();
});

ipcMain.handle('git:createBranch', async (_, name: string) => {
  return git.createBranch(name);
});

ipcMain.handle('git:commitAll', async (_, message) => {
  try {
    await git.commitAll(message);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('git:pushBranch', async () => {
  return git.pushBranch();
});
  
ipcMain.handle('git:getBranches', () => git.getBranches());

ipcMain.handle('git:getCurrentBranch', async () => {
  try {
    return git.getCurrentBranch();
  } catch {
    return null;
  }
});

ipcMain.handle(
  'git:checkoutBranch',
  (_, branch: string) => git.checkoutBranch(branch),
);

ipcMain.handle(
  'git:mergeBranch',
  (_, source: string, target: string) =>
    git.mergeBranch(source, target),
);



class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
