"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var crypt = require("crypto");
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
function writeJSONData(dataFile, data, password, encrypt) {
    if (encrypt === void 0) { encrypt = true; }
    var json = JSON.stringify(data);
    if (encrypt) {
        json = encryptString(json, password);
    }
    fs.writeFileSync(path.join(dataPath, dataFile), json, 'utf-8');
}
exports.writeJSONData = writeJSONData;
function readJSONData(dataFile, password, decrypt) {
    if (decrypt === void 0) { decrypt = true; }
    var readData = fs.readFileSync(path.join(dataPath, dataFile), 'utf-8');
    if (decrypt) {
        readData = decryptString(readData, password);
    }
    return JSON.parse(readData);
}
exports.readJSONData = readJSONData;
function encryptString(data, password) {
    var cipher = crypt.createCipher(algorithm, password);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}
function decryptString(data, password) {
    var decipher = crypt.createDecipher(algorithm, password);
    var dec = decipher.update(data, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
function resetAllData() {
    fs.emptyDirSync(dataPath);
}
exports.resetAllData = resetAllData;
//# sourceMappingURL=fileManager.js.map