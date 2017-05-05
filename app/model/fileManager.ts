import * as fs from 'fs-extra';

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

export function writeJSONData(dataFile: string, data: object) {
    let json: string = JSON.stringify(data);
    fs.writeFileSync(path.join(dataPath, dataFile), json, 'utf-8');
}

export function readJSONData(dataFile:string): object {
    let readData: string = fs.readFileSync(path.join(dataPath, dataFile), 'utf-8');
    return JSON.parse(readData);
}

export function deleteElection(dataDir:string):void {
    fs.removeSync(path.join(dataPath, dataDir));
}

export function resetAllData() {
    fs.emptyDirSync(dataPath);
}

export function appInitialized(dataFile:string):boolean {
    let appDataPath = path.join(dataPath, dataFile);
    if (!fs.existsSync(appDataPath)) {
        resetAllData();
        let appData:election.appDataInterface = { elections: [] }
        writeJSONData(dataFile, appData);
    } 
    return true; 
}