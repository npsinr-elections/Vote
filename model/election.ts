'use strict';

class Election {
    offices: Office[];
    constructor(public name: string, public desciption: string, public image: string, public fontColor: string) {
        this.offices = [];
    }

    addOffice(office: Office): void {
        this.offices.push(office);
    }

    removeOffice(office: Office):void {
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
        this.votes ++;
    }
}
