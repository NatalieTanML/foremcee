/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  globalShortcut,
  Notification,
  ipcMain,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { menubar } from 'menubar';
import Preferences from './preferences';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.allowRendererProcessReuse = false;

const APPLICATION_DIR = app.getPath('userData');
const STT_DIRECTORY = __dirname;
let mainWindow: BrowserWindow | null = null;
const preferences = new Preferences();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createRecordingWindow = async (
  applicationDir: string,
  sttDir: string
) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    icon: getAssetPath('icon.png'),
    show: false,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html#/recorder`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('init-menubar', {
      applicationDir,
      sttDir,
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const createMenubar = async (applicationDir: string, sttDir: string) => {
  const mb = menubar({
    index: `file://${__dirname}/index.html`,
    tooltip: 'Voice Notes',
    icon: getAssetPath(path.join('icons', '16x16.png')),
    showDockIcon: false,
    browserWindow: {
      transparent: false,
      alwaysOnTop: false,
      width: 550,
      height: 600,
      resizable: !app.isPackaged,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        devTools: !app.isPackaged,
      },
    },
  });

  mb.on('after-create-window', () => {
    app.dock.hide();
    mb.window?.webContents.send('init-menubar', {
      applicationDir,
      sttDir,
    });
  });

  // eslint-disable-next-line
  new AppUpdater();
};

function showNotification(title: string, body: string) {
  new Notification({ title, body }).show();
}

function startRecording() {
  if (mainWindow === null) {
    createRecordingWindow(APPLICATION_DIR, STT_DIRECTORY);
    showNotification('Recording Started', 'Transcibing your voice...');
  } else {
    mainWindow.webContents.send('recording:stop', true);
  }
}

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

app.on('ready', async () => {
  const hotKey = await preferences.getHotKey();

  ipcMain.on('recording:saved', async () => {
    if (mainWindow !== null) {
      mainWindow.close();
      showNotification(
        'Recording Completed',
        'Your recording and transcript can be accessed from the menu bar application'
      );
    }
  });

  ipcMain.on('hotKey:update', async (event, newHotKey) => {
    try {
      globalShortcut.unregisterAll();
      globalShortcut.register(newHotKey, startRecording);
      await preferences.updateHotKey(newHotKey);
      event.reply('hotKey:success');
    } catch (err) {
      event.reply('hotKey:fail', err);
      // Fallback to previous hotkey
      globalShortcut.register(hotKey, startRecording);
    }
  });

  globalShortcut.register(hotKey, startRecording);

  createMenubar(APPLICATION_DIR, STT_DIRECTORY);
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (mainWindow === null) createWindow();
});
