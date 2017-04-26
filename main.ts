import {app, BrowserWindow, ipcMain} from "electron";
import * as path from "path";
import * as url from "url";

require('electron-debug')(); //ONLY DURING DEVELOPMENT!! (Ctrl+Shift+I:DevTools, Ctrl+R:Reload)

let win:Electron.BrowserWindow = null;

function createHomeWindow () {
    // Opening the Home Page
  win = new BrowserWindow({width: 800, height: 600, show:false})
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.once('ready-to-show', () => {
      win.show();
  })

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createHomeWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createHomeWindow()
  }
})


ipcMain.on('newElection', (event, arg) => {
    console.log(arg);
})