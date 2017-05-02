const {ipcRenderer} = require('electron')
import * as election from '../model/election';

let electionData : election.ElectionDataInterface = null;

let editTitle = document.getElementById('election-title') as HTMLHeadingElement;
let editSubTitle = document.getElementById('election-subtitle') as HTMLHeadingElement;

ipcRenderer.on('loadElectionData', (event, arg:election.ElectionDataInterface) => {
    loadElection(arg);
}) 

function loadElection(data:election.ElectionDataInterface) {
    electionData = data;
    editTitle.innerHTML = data.name;
    editSubTitle.innerHTML = data.description;
}

console.log('');