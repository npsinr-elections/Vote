"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var algorithm = 'aes-256-ctr';
var path = require("path");
var shortid = require("shortid");
var electron_1 = require("electron");
var dataPath = electron_1.app.getPath('userData');
function newElectionData() {
    var randomDir = shortid.generate();
    var imageDir = shortid.generate();
    var dataFile = shortid.generate();
    fs.mkdirSync(path.join(dataPath, randomDir));
    fs.mkdirSync(path.join(dataPath, randomDir, imageDir));
    return { 'randomDir': randomDir, 'imageDir': imageDir, 'dataFile': dataFile };
}
exports.newElectionData = newElectionData;
function writeJSONData(dataFile, data) {
    var json = JSON.stringify(data);
    fs.writeFileSync(path.join(dataPath, dataFile), json, 'utf-8');
}
exports.writeJSONData = writeJSONData;
function readJSONData(dataFile) {
    var readData = fs.readFileSync(path.join(dataPath, dataFile), 'utf-8');
    return JSON.parse(readData);
}
exports.readJSONData = readJSONData;
function resetAllData() {
    fs.emptyDirSync(dataPath);
}
exports.resetAllData = resetAllData;
function appInitialized(dataFile) {
    var appDataPath = path.join(dataPath, dataFile);
    if (!fs.existsSync(appDataPath)) {
        resetAllData();
        var appData = { elections: [] };
        writeJSONData(dataFile, appData);
    }
    return true;
}
exports.appInitialized = appInitialized;
//# sourceMappingURL=fileManager.js.map