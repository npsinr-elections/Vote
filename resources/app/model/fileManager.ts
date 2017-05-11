import * as fs from 'fs-extra';

import * as path from 'path';
import * as shortid from 'shortid';

import * as election from './election';

import { app } from 'electron';

const dataPath: string = app.getPath('userData');

export function newElectionData(): { randomDir: string, imageDir: string, dataFile: string, imageData: string } {
    let randomDir: string = shortid.generate();
    let imageDir: string = path.join(randomDir, shortid.generate());
    let dataFile: string = path.join(randomDir, shortid.generate());
    let imageData: string = path.join(randomDir, shortid.generate());

    fs.mkdirSync(path.join(dataPath, randomDir));
    fs.mkdirSync(path.join(dataPath, imageDir));

    return { 'randomDir': randomDir, 'imageDir': imageDir, 'dataFile': dataFile, 'imageData': imageData };
}

export function saveElectionData(data: election.ElectionDataInterface, appData: election.appDataInterface, appDataFile: string) {
    // Read the old data, important for configuring image saves
    let imageData: any = readJSONData(data.imageData);
    let foundIds = [];

    updateObjectImage(data, imageData, data.imageDir);
    foundIds.push(data.id);

    for (let i = 0; i < data.offices.length; i++) {
        let office = data.offices[i]
        updateObjectImage(office, imageData, data.imageDir);
        foundIds.push(office.id);

        for (let j = 0; j < office.candidates.length; j++) {
            let candidate = office.candidates[j];
            updateObjectImage(candidate, imageData, data.imageDir);
            foundIds.push(candidate.id);
        }
    }

    for (let key in imageData) {
        if (imageData.hasOwnProperty(key)) {
            if (foundIds.indexOf(key) == -1) {
                fs.removeSync(path.join(dataPath, data.imageDir, imageData[key]));
                delete imageData[key];
            }
        }
    }

    writeJSONData(data.dataFile, data);
    writeJSONData(data.imageData, imageData);

    let electionObj = <election.electionObject>election.getElectionById(data.id, appData);

    if (electionObj.name !== data.name) {
        electionObj.name = data.name;
        writeJSONData(appDataFile, appData);
    }

    return "Saved"
}

function updateObjectImage(data: { id: string, image: string, [propname: string]: any }, imageData: object, imageDir: string) {
    let saveNewImage: boolean = false;
    console.log(data);
    if (!imageData.hasOwnProperty(data.id)) {
        // Newly Created object, copy the new image:
        saveNewImage = true;
    } else {
        // Editing an already created object, check whether image has changed or not.
        if (imageData[data.id] !== path.basename(data.image)) {
            fs.removeSync(path.join(dataPath, imageDir, imageData[data.id])); // Remove old image
            saveNewImage = true;
        }
    }

    if (saveNewImage) {
        let newImagePath = storeImageData(data.image, imageDir);
        data.image = newImagePath;
        imageData[data.id] = path.basename(newImagePath);
    }
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