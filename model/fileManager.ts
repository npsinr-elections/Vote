import * as fs from 'fs-extra';

import * as crypt from 'crypto';
let algorithm: string = 'aes-256-ctr';

import * as path from 'path';
import * as shortid from 'shortid';

import * as election from './election';

import {app} from 'electron';

const dataPath:string = app.getPath('userData');

export function newElectionData(): { randomDir: string, imageDir: string, dataFile: string } {
    let randomDir: string = shortid.generate();
    let imageDir: string = shortid.generate();
    let dataFile: string = shortid.generate();

    fs.mkdirSync(path.join(dataPath, randomDir));
    fs.mkdirSync(path.join(dataPath, randomDir, imageDir));

    return { 'randomDir': randomDir, 'imageDir': imageDir, 'dataFile': dataFile };
}

export function writeJSONData(dataFile: string, data: object, password: string, encrypt: boolean = true) {
    let json: string = JSON.stringify(data);
    if (encrypt) {
        json = encryptString(json, password);
    }
    fs.writeFileSync(path.join(dataPath, dataFile), json, 'utf-8');
}

export function readJSONData(dataFile:string, password: string, decrypt: boolean = true): object {
    let readData: string = fs.readFileSync(path.join(dataPath, dataFile), 'utf-8');
    if (decrypt) {
        readData = decryptString(readData, password);
    }
    return JSON.parse(readData);
}

function encryptString(data: string, password: string):string {
    let cipher = crypt.createCipher(algorithm, password)
    let crypted = cipher.update(data, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decryptString(data: string, password: string): string {
    let decipher = crypt.createDecipher(algorithm, password);
    let dec = decipher.update(data, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

export function resetAllData() {
    fs.emptyDirSync(dataPath);
}