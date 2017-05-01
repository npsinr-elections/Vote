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

const dataPath:string = app.getPath('userData');
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
  // keytar.deletePassword('voteApp','password').then(()=>{console.log('delete success')}, (err)=>{console.log(err)});
  get_password((password: string) => {
    if (password !== null) {
      appData = <election.appDataInterface>(fileManager.readJSONData(appDataFile,password));
      console.log(appData);
      createHomeWindow();
    } else {
      // Assuming App opened first time.
      fileManager.resetAllData();
      let encryptPassword: string = crypt.randomBytes(256).toString('hex');
      keytar.setPassword('voteApp', 'password', encryptPassword).then(() => {
        appData = {elections:[]}
        fileManager.writeJSONData(appDataFile, appData, encryptPassword);
        createHomeWindow();
      }, (err) => { console.log(err); })
    }

  })
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('newElection', (event, arg: election.newElectionInterface) => {
  get_password((password: string) => {
    let loadData:election.ElectionDataInterface = election.initNewElection(arg, appData, appDataFile, password);
    console.log(loadData);
    // loadElectionWindow(loadData);
  })
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
}

function get_password(callback) {
  keytar.getPassword('voteApp', 'password').then(callback, (err) => {
    console.log(err);
  });
}