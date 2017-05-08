'use strict';

const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;
import * as election from '../model/election';

let electionData: election.ElectionDataInterface = null;

let electionDataFields = document.getElementsByClassName('electionData');

let editTitle = document.getElementById('election-title') as HTMLHeadingElement;
let editSubTitle = document.getElementById('election-subtitle') as HTMLHeadingElement;

let editElectionBtn = document.getElementById('editElectionBtn');
let editElectionModal = document.getElementById('editElection');
let saveEditElection = document.getElementById('saveEditElection');
let closeEditElection = document.getElementById('closeEditElection');

function toggleEditElection() {
    editElectionModal.classList.toggle('is-active');
}

editElectionBtn.addEventListener('click', function () {
    toggleEditElection();
})

closeEditElection.addEventListener('click', function () {
    toggleEditElection();
    resetElectionData();
})

saveEditElection.addEventListener('click', function () {
    let inputData: HTMLInputElement;
    let collectData = <Object>{};

    for (let i = 0; i < electionDataFields.length; i++) {
        inputData = <HTMLInputElement>electionDataFields[i];
        if (inputData.value.replace(/\s/g, "").length == 0) {
            dialog.showErrorBox("Some data wasn't entered...", 'Please fill all the fields!');
            return;
        }
        collectData[inputData.name] = inputData.value;
    }

    // All field were valid, now store the data
    for (let key in collectData) {
        if (collectData.hasOwnProperty(key)) {
            electionData[key] = collectData[key];
        }
    }

    resetElectionData();

    let result = ipcRenderer.sendSync('saveElectionData', electionData);
    if (result == 'Saved') {
        let loadAsk = dialog.showMessageBox({ type: 'info', message: 'Success', buttons: ['Ok'], detail: electionData.name+" has been saved succesfully."})
    }

    toggleEditElection();
})

ipcRenderer.on('loadElectionData', (event, arg: election.ElectionDataInterface) => {
    loadElection(arg);
})

let imageBtn = <HTMLButtonElement>document.getElementById('imageBtn');
let imageInput = <HTMLInputElement>document.getElementById('imageInput');

let electionImagePreview = document.getElementById('electionImgPreview');

// Open file explorer window to select image.
imageBtn.addEventListener('click', () => {
    let imagePath: string[] = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
    })

    previewImage(imagePath, electionImagePreview, imageInput, electionData.image);
})

function previewImage(imagePath, imagePreview, imageInput, initalValue = '') {
    let previewImage = imagePreview.firstElementChild;
    if (typeof imagePath != 'undefined') {
        imageInput.value = imagePath[0];
        previewImage.src = imagePath[0];
        imagePreview.style.display = 'block';
    } else {
        imageInput.value = initalValue;
        if (initalValue == '') {
            imagePreview.style.display = 'none';
        }
        previewImage.src = initalValue;
    }
}

let electionTitleColorBtn = document.getElementById('electionTitleColorBtn');
let electionBackColorBtn = document.getElementById('electionBackColorBtn');

function loadElection(data: election.ElectionDataInterface) {
    electionData = data;
    resetElectionData();
}

function resetElectionData() {
// Set the current data values in the edit election popup.

    editTitle.innerHTML = electionData.name;
    editSubTitle.innerHTML = electionData.description;

    let inputData: HTMLInputElement;
    for (let i = 0; i < electionDataFields.length; i++) {
        inputData = <HTMLInputElement>electionDataFields[i];
        inputData.value = electionData[inputData.name]
    }
    let electionImage = <HTMLImageElement>electionImagePreview.firstElementChild;

    electionImage.src = electionData.image;

    electionBackColorBtn.style.backgroundColor = electionData.backColor;
    electionTitleColorBtn.style.backgroundColor = electionData.fontColor;
}