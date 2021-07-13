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
import SpeechToText from './speech-to-text';
// import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.allowRendererProcessReuse = false;

const APPLICATION_DIR = app.getPath('userData');
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

const createRecordingWindow = async (applicationDir: string) => {
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
    show: false,
    icon: getAssetPath('icon.png'),
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html#/recorder`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('init-menubar', applicationDir);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const createMenubar = async (applicationDir: string) => {
  const mb = menubar({
    index: `file://${__dirname}/index.html`,
    tooltip: 'Voice Notes',
    browserWindow: {
      transparent: false,
      alwaysOnTop: false,
      width: 550,
      height: 600,
      // resizable: false, // Uncomment when building for prod
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    },
  });

  mb.on('after-create-window', () => {
    mb.window?.webContents.openDevTools({ mode: 'right' });
    mb.window?.webContents.send('init-menubar', applicationDir);
  });

  // eslint-disable-next-line
  new AppUpdater();
};

function showNotification(title: string, body: string) {
  new Notification({ title, body }).show();
}

function startRecording() {
  if (mainWindow === null) {
    createRecordingWindow(APPLICATION_DIR);
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

  try {
    // TODO: Present a one time setup UI for dependency installation.
    console.log('Installing Speech-To-Text dependencies...');
    await SpeechToText.installDependencies(APPLICATION_DIR);
    console.log('Installation complete, starting program...');
  } catch (err) {
    console.error(err);
    throw err;
  }

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

  createMenubar(APPLICATION_DIR);
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (mainWindow === null) createWindow();
});
