import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import * as election from "./model/election";
import * as crypt from "crypto";
import * as keytar from "keytar";
import * as fileManager from "./model/fileManager"

// require('electron-debug')(); //ONLY DURING DEVELOPMENT!! (Ctrl+Shift+I:DevTools, Ctrl+R:Reload)

let win: Electron.BrowserWindow = null;
let editElections: Electron.BrowserWindow = null;

let appData: election.appDataInterface;

const dataPath: string = app.getPath('userData');
console.log(dataPath);
const appDataFile = 'app_data.json'

function createHomeWindow() {
  // Opening the Home Page
  win = new BrowserWindow({ width: 800, height: 600, show: false })
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
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

app.on('ready', () => {
  if (fileManager.appInitialized(appDataFile)) {
    appData = <election.appDataInterface>(fileManager.readJSONData(appDataFile));
    console.log(appData);
    createHomeWindow();
  }

})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('newElection', (event, arg: election.newElectionInterface) => {
  let loadData: election.ElectionDataInterface = election.initNewElection(arg, appData, appDataFile);
  console.log(loadData);
  loadElectionWindow(loadData);
})

function loadElectionWindow(arg: election.ElectionDataInterface) {
  editElections = new BrowserWindow({ width: 800, height: 600, show: false })
  editElections.loadURL(url.format({
    pathname: path.join(__dirname, 'edit.html'),
    protocol: 'file:',
    slashes: true
  }))
  editElections.webContents.on('did-finish-load', () => {
    editElections.webContents.send('loadElectionData', arg);
  })
  editElections.show();
}