import * as fs from 'fs-extra';

import * as path from 'path';
import * as shortid from 'shortid';

import * as election from './election';

import { app } from 'electron';

const dataPath: string = app.getPath('userData');

export function newElectionData(): { randomDir: string, imageDir: string, dataFile: string } {
    let randomDir: string = shortid.generate();
    let imageDir: string = path.join(randomDir, shortid.generate());
    let dataFile: string = path.join(randomDir, shortid.generate());

    fs.mkdirSync(path.join(dataPath, randomDir));
    fs.mkdirSync(path.join(dataPath, imageDir));

    return { 'randomDir': randomDir, 'imageDir': imageDir, 'dataFile': dataFile };
}

export function saveElectionData(data: election.ElectionDataInterface, appData: election.appDataInterface, appDataFile: string) {
    // Read the old data, important for configuring image saves
    let oldData = <election.ElectionDataInterface>readJSONData(data.dataFile);

    if (oldData.image !== data.image) {
        fs.removeSync(oldData.image);
        let newImagePath = storeImageData(data.image, data.imageData);
        data.image = newImagePath;
        console.log('Saved a new image')
    } else {
        console.log('Skipping image re-save.')
    }

    writeJSONData(data.dataFile, data);

    // Election Object HAS to exist, no need for false-checking.
    let electionObj = <election.electionObject>election.getElectionById(data.id, appData);

    if (electionObj.name !== data.name) {
        electionObj.name = data.name;
        writeJSONData(appDataFile, appData);
    }

    return "Saved"
}

export function storeImageData(image: string, imageDir: string) {
    //Note that imagePath has dataPATH INCLUDED, for benefit of the render process to directly link images in <img src='' />
    let newImageName: string = shortid.generate() + path.extname(image)
    let newImagePath: string = path.join(dataPath, imageDir, newImageName);
    fs.copySync(image, newImagePath);
    return newImagePath;
}
export function writeJSONData(dataFile: string, data: object) {
    let json: string = JSON.stringify(data);
    fs.writeFileSync(path.join(dataPath, dataFile), json, 'utf-8');
}

export function readJSONData(dataFile: string): object {
    let readData: string = fs.readFileSync(path.join(dataPath, dataFile), 'utf-8');
    return JSON.parse(readData);
}

export function deleteElection(dataDir: string): void {
    fs.removeSync(path.join(dataPath, dataDir));
}

export function resetAllData() {
    fs.emptyDirSync(dataPath);
}

export function appInitialized(dataFile: string): boolean {
    let appDataPath = path.join(dataPath, dataFile);
    if (!fs.existsSync(appDataPath)) {
        resetAllData();
        let appData: election.appDataInterface = { elections: [] }
        writeJSONData(dataFile, appData);
    }
    return true;
}