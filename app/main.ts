import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as url from "url";
import * as election from "./model/election";
import * as crypt from "crypto";
import * as keytar from "keytar";
import * as fileManager from "./model/fileManager"


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
  let loadAsk = dialog.showMessageBox({type:'info',message:'Election Created Succesfully!',buttons:['Yes','No'],detail:'Do you want to load your new election?'})
  if (loadAsk == 0) {
  loadElectionWindow(loadData);
  }
})

ipcMain.on('getElections', (event) => {
  event.returnValue = appData.elections;
})

ipcMain.on('deleteElection', (event, arg:string) => {
  for (let i=0; i<appData.elections.length; i++) {
    let current = appData.elections[i]
    if (current.id == arg) {
      let dataDir = current.dataDirectory;
      fileManager.deleteElection(dataDir);
      event.returnValue = "Election "+current.name+" was succesfully deleted!";
      appData.elections.splice(i,1);
      console.log(appData);
      fileManager.writeJSONData(appDataFile, appData);
      return;
    }
  }
  event.returnValue = "ERROR";
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