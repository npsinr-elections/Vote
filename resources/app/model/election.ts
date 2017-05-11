'use strict';

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

export function getElectionById(id: string, appData:appDataInterface) {
  for (let i = 0; i < appData.elections.length; i++) {
    if (appData.elections[i].id == id) {
      return appData.elections[i]
    }
  }
  return false;
}

export function getOfficeById(id:string, offices:officeDataInterface[]) {
    for (let i=0; i<offices.length; i++) {
        if (offices[i].id == id) {
            return <officeDataInterface>offices[i]
        }
    }
    return false;
}

export function getCandidateById(id:string, office:officeDataInterface) {
    for (let i=0; i<office.candidates.length; i++) {
        if (office.candidates[i].id == id) {
            return <candidateDataInterface>office.candidates[i]
        }
    }
    return false;
}
export interface newElectionInterface {
    // Describes a newly created election object
    name: string;
    description: string;
    image: string;
    backColor: string;
    fontColor: string;
}

export interface officeDataInterface extends newElectionInterface{
    id:string;
    candidates: candidateDataInterface[];
}

export interface candidateDataInterface {
    id:string;
    name:string;
    image:string;
}

export interface ElectionDataInterface extends newElectionInterface {
    id: string;
    imageDir: string;
    imageData:string;
    dataFile: string;
    dataDirectory: string;
    offices: officeDataInterface[];
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
