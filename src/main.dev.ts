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
  shell,
  Notification,
  ipcMain,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log, { create } from 'electron-log';
import { menubar } from 'menubar';
import Preferences from './preferences';
// import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

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

const createRecordingWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    height: 500,
    width: 500,
    show: false,
    icon: getAssetPath('icon.png'),
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html?redirect=recorder`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const createMenubar = async () => {
  const mb = menubar({
    index: `file://${__dirname}/index.html`,
    tooltip: 'Voice Notes',
    browserWindow: {
      transparent: false,
      alwaysOnTop: false,
      width: 1024,
      height: 728,
      webPreferences: {
        nodeIntegration: true,
      },
    },
  });

  mb.on('after-create-window', () => {
    mb.window?.webContents.openDevTools({ mode: 'right' });
  });
  // eslint-disable-next-line
  new AppUpdater();
};

function showNotification(title: string, body: string) {
  new Notification({ title, body }).show();
}

createMenubar();

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

  ipcMain.on('recording:saved', () => {
    if (mainWindow !== null) {
      mainWindow.close();
      showNotification(
        'Recording Completed',
        'Your recording and transcript can be accessed from the menu bar application'
      );
    }
  });

  globalShortcut.register(hotKey, () => {
    if (mainWindow === null) {
      createRecordingWindow();
      showNotification('Recording Started', 'Transcibing your voice...');
    } else {
      mainWindow.webContents.send('recording:stop', true);
    }
  });
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (mainWindow === null) createWindow();
});
