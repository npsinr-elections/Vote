'use strict';
import * as election from "../model/election"
const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;

let newElectionModal = <HTMLDivElement>document.getElementById('newElection');
let loadElectionModal = <HTMLDivElement>document.getElementById('loadElection')
// Show new election modal popup.
function toggleNewElection() {
    newElectionModal.classList.toggle('is-active');
}

function toggleLoadElection() {
    loadElectionModal.classList.toggle('is-active');
}
let newElectionBtn = <HTMLButtonElement>document.getElementById('newElectionBtn');
newElectionBtn.addEventListener('click', toggleNewElection);

let loadElectionBtn = <HTMLButtonElement>document.getElementById('loadElectionBtn');
loadElectionBtn.addEventListener('click', openElectionsView);

let closeNewElection = <HTMLButtonElement>document.getElementById('closeNewElection');
closeNewElection.addEventListener('click', toggleNewElection);

let closeLoadElection = <HTMLButtonElement>document.getElementById('closeLoadElection');
closeLoadElection.addEventListener('click', toggleLoadElection);

let imageBtn = <HTMLButtonElement>document.getElementById('imageBtn');
let imageInput = <HTMLInputElement>document.getElementById('imageInput');

// Open file explorer window to select image.
imageBtn.addEventListener('click', () => {
    let imagePath: string[] = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
    })

    imageInput.value = (typeof imagePath != 'undefined') ? imagePath[0] : '';

})

let createElectionBtn = <HTMLButtonElement>document.getElementById('createElectionBtn');

// All the inputfields in the create election popup modal.
let newElectionData = <HTMLCollection>document.getElementsByClassName('newElectionData');

let newElectionObject: election.newElectionInterface;
// Create an object storing new election data
createElectionBtn.addEventListener('click', () => {

    let newElectionObject = <any>{};
    let inputData: HTMLInputElement;
    for (let i = 0; i < newElectionData.length; i++) {
        inputData = <HTMLInputElement>newElectionData[i];
        newElectionObject[inputData.name] = inputData.value;
    }
    ipcRenderer.send('newElection', newElectionObject);
    toggleNewElection();
})

// Container Div which has the list of elections.
let electionListContainer = document.getElementById('electionsList');

// Var for a single election element, which will be appended to the electionListContainer.
let electionElements = document.getElementsByClassName('electionElement');
let loadElectionElementBtn = <HTMLButtonElement>document.getElementById('loadElectionElementBtn');

function openElectionsView() {
    let electionsList: election.electionObject[] = ipcRenderer.sendSync('getElections');
    electionListContainer.innerHTML = '';
    for (let i = 0; i < electionsList.length; i++) {
        electionListContainer.appendChild(createElectionElement(electionsList[i]));
    }
    toggleLoadElection();
}

function createElectionElement(data:election.electionObject): HTMLAnchorElement {
    let electionElement = document.createElement('a');
    electionElement.className = 'panel-block electionElement';

    let electionName = document.createTextNode(data.name);

    let editIcons = document.createElement('nav');
    editIcons.className = 'editIcons';
    editIcons.dataset.id = data.id;
    editIcons.dataset.name = data.name;
    editIcons.dataset.dataDirectory = data.dataDirectory;
    editIcons.dataset.dataFile = data.dataFile;

    let loadIcon = document.createElement('i');
    loadIcon.className = 'editIcon typcn typcn-download-outline';
    loadIcon.title = 'Load Election';

    let deleteIcon = document.createElement('i');
    deleteIcon.className = 'editIcon typcn typcn-trash';
    deleteIcon.title = 'Delete Election';
    
    editIcons.appendChild(loadIcon);
    editIcons.appendChild(deleteIcon);

    electionElement.appendChild(electionName);
    electionElement.appendChild(editIcons);

    return electionElement;
}