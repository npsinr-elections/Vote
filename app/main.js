"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var election = require("./model/election");
var fileManager = require("./model/fileManager");
// require('electron-debug')(); //ONLY DURING DEVELOPMENT!! (Ctrl+Shift+I:DevTools, Ctrl+R:Reload)
var win = null;
var editElections = null;
var appData;
var dataPath = electron_1.app.getPath('userData');
console.log(dataPath);
var appDataFile = 'app_data.json';
function createHomeWindow() {
    // Opening the Home Page
    win = new electron_1.BrowserWindow({ width: 800, height: 600, show: false });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.once('ready-to-show', function () {
        win.show();
    });
    win.on('closed', function () {
        win = null;
    });
}
electron_1.app.on('ready', function () {
    if (fileManager.appInitialized(appDataFile)) {
        appData = (fileManager.readJSONData(appDataFile));
        console.log(appData);
        createHomeWindow();
    }
});
electron_1.app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.on('newElection', function (event, arg) {
    var loadData = election.initNewElection(arg, appData, appDataFile);
    console.log(loadData);
    // loadElectionWindow(loadData);
});
function loadElectionWindow(arg) {
    editElections = new electron_1.BrowserWindow({ width: 800, height: 600, show: false });
    editElections.loadURL(url.format({
        pathname: path.join(__dirname, 'edit.html'),
        protocol: 'file:',
        slashes: true
    }));
    editElections.webContents.on('did-finish-load', function () {
        editElections.webContents.send('loadElectionData', arg);
    });
}
//# sourceMappingURL=main.js.map