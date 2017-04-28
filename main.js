"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var election = require("./model/election");
var crypt = require("crypto");
var keytar = require("keytar");
var fileManager = require("./model/fileManager");
// require('electron-debug')(); //ONLY DURING DEVELOPMENT!! (Ctrl+Shift+I:DevTools, Ctrl+R:Reload)
var win = null;
var editElections = null;
var appData;
var dataPath = electron_1.app.getPath('userData');
var appDataFile = 'app_data.json';
function createHomeWindow() {
    // Opening the Home Page
    win = new electron_1.BrowserWindow({ width: 800, height: 600, show: false });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
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
    // keytar.deletePassword('voteApp','password').then(()=>{console.log('delete success')}, (err)=>{console.log(err)});
    get_password(function (password) {
        if (password !== null) {
            appData = (fileManager.readJSONData(appDataFile, password));
            console.log(appData);
            createHomeWindow();
        }
        else {
            // Assuming App opened first time.
            fileManager.resetAllData();
            var encryptPassword_1 = crypt.randomBytes(256).toString('hex');
            keytar.setPassword('voteApp', 'password', encryptPassword_1).then(function () {
                appData = { elections: [] };
                fileManager.writeJSONData(appDataFile, appData, encryptPassword_1);
                createHomeWindow();
            }, function (err) { console.log(err); });
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.on('newElection', function (event, arg) {
    get_password(function (password) {
        var loadData = election.initNewElection(arg, appData, appDataFile, password);
        console.log(loadData);
        // loadElectionWindow(loadData);
    });
});
function loadElectionWindow(arg) {
    editElections = new electron_1.BrowserWindow({ width: 800, height: 600, show: false });
    editElections.loadURL(url.format({
        pathname: path.join(__dirname, 'app/edit.html'),
        protocol: 'file:',
        slashes: true
    }));
    editElections.webContents.on('did-finish-load', function () {
        editElections.webContents.send('loadElectionData', arg);
    });
}
function get_password(callback) {
    keytar.getPassword('voteApp', 'password').then(callback, function (err) {
        console.log(err);
    });
}
//# sourceMappingURL=main.js.map