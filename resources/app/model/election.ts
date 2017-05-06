'use strict';
import * as shortid from "shortid";
import * as fs from "fs";
import * as path from "path";
import * as fileManager from "./fileManager";

class Election {
    offices: Office[];
    constructor(public name: string, public desciption: string, public image: string, public fontColor: string) {
        this.offices = [];
    }

    addOffice(office: Office): void {
        this.offices.push(office);
    }

    removeOffice(office: Office): void {
        let index = this.offices.indexOf(office);
        this.offices.splice(index, 1);
    }
}

class Office {
    candidates: Candidate[];

    constructor(public name: string, public desciption: string, public image: string, public fontColor: string) {
        this.candidates = [];
    }

    addCandidate(candidate: Candidate): void {
        this.candidates.push(candidate);
    }

    removeCandidate(candidate: Candidate): void {
        let index = this.candidates.indexOf(candidate);
        this.candidates.splice(index, 1);
    }
}

class Candidate {
    votes: number;

    constructor(public name: string, image: string) {
        this.votes = 0;
    }

    vote() {
        this.votes++;
    }
}

export function initNewElection(data: newElectionInterface, appData: appDataInterface, appDataFile: string): ElectionDataInterface {
    let { dataFile, imageDir, randomDir } = fileManager.newElectionData();

    let electionId: string = shortid.generate();

    data['id'] = electionId
    data['dataDirectory'] = randomDir;
    data['dataFile'] = dataFile;
    data['imageData'] = imageDir;
    data['offices'] = [];

    fileManager.writeJSONData(path.join(randomDir, dataFile), data);

    appData.elections.push({ name: data.name, id: electionId, dataDirectory: randomDir, dataFile: dataFile })

    fileManager.writeJSONData(appDataFile, appData);

    return <ElectionDataInterface>data;
}

export interface newElectionInterface {
    // Describes a newly created election object
    name: string;
    description: string;
    image: string;
    backColor: string;
    fontColor: string;
}

export interface ElectionDataInterface extends newElectionInterface {
    id: string;
    imageData: string;
    dataFile: string;
    dataDirectory: string;
    offices: Office[];
}

export interface appDataInterface {
    elections:  electionObject[];
}

export interface electionObject {
    name: string; 
    id: string; 
    dataDirectory: string; 
    dataFile: string;
}