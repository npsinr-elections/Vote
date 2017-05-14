'use strict';

import * as election from '../model/election';

const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;

import * as shortid from "shortid";

import * as Popups from "./electionPopup"

let electionName = document.getElementsByClassName('electionTitle')[0];
let electionDescription = document.getElementsByClassName('electionSubTitle')[0];
let editElectionBtn = document.getElementsByClassName('editElectionBtn')[0];

// Recieve electionData for the page from the main Processs
ipcRenderer.on('loadElectionData', (event, arg: election.ElectionDataInterface) => {
    loadElection(arg);
})



function loadElection(data: election.ElectionDataInterface) {
    electionName.id = data.id + '-name';
    electionDescription.id = data.id + '-description';

    let electionCard = new Popups.ElectionCard(data.id)
}



