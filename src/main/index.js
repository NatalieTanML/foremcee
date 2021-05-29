import { app, globalShortcut, BrowserWindow, Notification } from 'electron'
import { menubar } from 'menubar'
import '../renderer/store'
import Preferences from './preferences'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow = null
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const recordingURL = `${winURL}/#/recorder`
const preferences = new Preferences()

const mb = menubar({
  index: winURL
})

mb.on('ready', () => {
  console.log('Menubar app is ready.')
})

app.on('ready', async () => {
  const hotKey = await preferences.getHotKey()
  globalShortcut.register(hotKey, () => {
    if (mainWindow === null) {
      createInvisibleWindow(recordingURL)
      showNotification('Recording Started', 'Transcibing your voice...')
    } else {
      mainWindow.close()
      showNotification('Recording Completed', 'Your recording and transcript can be accessed from the menu bar application')
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function createInvisibleWindow (url) {
  mainWindow = new BrowserWindow({
    height: 400,
    width: 400,
    show: false,
    webPreferences: {
      devTools: false,
      backgroundThrottling: false
    }
  })

  mainWindow.loadURL(url)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function showNotification (title, body) {
  new Notification({ title, body }).show()
}

// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
