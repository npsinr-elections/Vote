"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
require('electron-debug')(); //ONLY DURING DEVELOPMENT!! (Ctrl+Shift+I:DevTools, Ctrl+R:Reload)
var win = null;
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
electron_1.app.on('ready', createHomeWindow);
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createHomeWindow();
    }
});
electron_1.ipcMain.on('newElection', function (event, arg) {
    console.log(arg);
});
//# sourceMappingURL=main.js.map