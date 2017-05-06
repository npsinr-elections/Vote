import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as url from "url";
import * as election from "./model/election";
import * as fileManager from "./model/fileManager"


let win: Electron.BrowserWindow = null;
let editElections: Electron.BrowserWindow = null;

let appData: election.appDataInterface;

let loadedElection: election.ElectionDataInterface = null;

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
  let loadAsk = dialog.showMessageBox({ type: 'info', message: 'Election Created Succesfully!', buttons: ['Yes', 'No'], detail: 'Do you want to load your new election?' })
  if (loadAsk == 0) {
    loadElectionWindow(loadData);
  }
})

ipcMain.on('getElections', (event) => {
  event.returnValue = appData.elections;
})

ipcMain.on('loadElection', (event, arg: string) => {
  let electionObj = getElectionById(arg);
  if (electionObj !== false) {
    let electionData = <election.ElectionDataInterface>fileManager.readJSONData(path.join(electionObj.dataDirectory, electionObj.dataFile));
    loadElectionWindow(electionData);
  }
})

ipcMain.on('deleteElection', (event, arg: string) => {
  let electionObj = getElectionById(arg)
  if (electionObj !== false) {
    let dataDir = electionObj.dataDirectory;
    fileManager.deleteElection(dataDir);

    event.returnValue = "Election " + electionObj.name + " was succesfully deleted!";

    appData.elections.splice(appData.elections.indexOf(electionObj), 1);

    fileManager.writeJSONData(appDataFile, appData);
  } else {
    event.returnValue = "ERROR";
  }
})

function getElectionById(id: string) {
  for (let i = 0; i < appData.elections.length; i++) {
    if (appData.elections[i].id == id) {
      return appData.elections[i]
    }
  }
  return false;
}

function loadElectionWindow(arg: election.ElectionDataInterface) {
  if (editElections) {
    if (arg.id == loadedElection.id) {
      dialog.showMessageBox({type:'info',buttons:['Ok'],title:'Election Already Loaded',message:arg.name + ' has already been loaded in another window.', detail:'Please use that window to edit the election.'})
    } else {
      dialog.showErrorBox('Two Elections cannot be loaded simultaneously', 'Please close ' + loadedElection.name + ' to edit ' + arg.name);
    }
  } else {
    loadedElection = arg;
    editElections = new BrowserWindow({ width: 800, height: 600, show: false })
    editElections.loadURL(url.format({
      pathname: path.join(__dirname, 'edit.html'),
      protocol: 'file:',
      slashes: true
    }))

    editElections.webContents.on('did-finish-load', () => {
      editElections.webContents.send('loadElectionData', arg);
    })

    editElections.once('ready-to-show', () => {
      editElections.show();
    })

    editElections.on('closed', () => {
      editElections = null;
      loadedElection = null;
    })
  }
}