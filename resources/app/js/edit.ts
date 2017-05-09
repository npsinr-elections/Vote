'use strict';

const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;
import * as election from '../model/election';

let electionData: election.ElectionDataInterface = null; // The current electionData Object for this window.
let currentModalData = null; // The data currently in the popup election Modal.

let electionDataFields = document.getElementsByClassName('electionData'); // All the input fields in the popup modal.

// The headings on the top of the page.
let editTitle = document.getElementById('election-title') as HTMLHeadingElement;
let editSubTitle = document.getElementById('election-subtitle') as HTMLHeadingElement;

//Controls inside the election popup modal
let editElectionBtn = document.getElementById('editElectionBtn');
let editElectionModal = document.getElementById('editElection');
let electionModalTitle = document.getElementById('electionModalTitle')
let saveEditElection = document.getElementById('saveEditElection');
let closeEditElection = document.getElementById('closeEditElection');


// View/Hide the election popup modal
function toggleEditElectionModal() {
    editElectionModal.classList.toggle('is-active');
}

// Open the popup modal to edit the Election's top-level data.
function openEditElectionInfo() {
    electionModalTitle.innerHTML = "Edit Election: " + electionData.name;
    setModalData(electionData);
    currentModalData = electionData;
    saveEditElection.children[1].innerHTML = 'Save Changes';
    toggleEditElectionModal();
}

// Open the popup modal to edit a specific election's data.
function openEditOfficeInfo(data, newOffice = false) {
    if (newOffice) {
        editElectionModal.innerHTML = 'Create New Office';
        saveEditElection.children[1].innerHTML = "Create New Office";
        currentModalData = {candidates:[]};
        resetEditElectionModal();
    } else {
        editElectionModal.innerHTML = 'Edit Office: ' + data.name;
        saveEditElection.children[1].innerHTML = "Save Changes";
        setModalData(data);
        currentModalData = data;
    }
    toggleEditElectionModal();
}

// Clear all the fields in the edit ELection Modal.
function resetEditElectionModal() {
    let inputData: HTMLInputElement;
    for (let i = 0; i < electionDataFields.length; i++) {
        inputData = <HTMLInputElement>electionDataFields[i];
        inputData.value = '';
    }
    let electionImage = <HTMLImageElement>electionImagePreview.firstElementChild;

    electionImagePreview.style.display = 'none';
    electionImage.src = '';

    electionBackColorBtn.style.backgroundColor = '';
    electionTitleColorBtn.style.backgroundColor = '';
}

// Open the popup modal.
editElectionBtn.addEventListener('click', function () {
    openEditElectionInfo();
})

// Close the popup modal.
closeEditElection.addEventListener('click', function () {
    toggleEditElectionModal();
})

// Save all the data currently in the popup modal into the currentData variable, and then send it to the main
// processs for saving locally.
saveEditElection.addEventListener('click', function () {
    let inputData: HTMLInputElement;
    let collectData = <Object>{};

    // Check if fields are not blank
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
            currentModalData[key] = collectData[key];
        }
    }

    // Ask the main Process to save the Data, display success message
    let result = ipcRenderer.sendSync('saveElectionData', electionData);
    if (result == 'Saved') {
        let loadAsk = dialog.showMessageBox({ type: 'info', message: 'Success', buttons: ['Ok'], detail: electionData.name + " has been saved succesfully." })
    }

    // This is to make sure the title is updated, if the election name and subtitle were changed.
    editTitle.innerHTML = electionData.name;
    editSubTitle.innerHTML = electionData.description;

    // Close the popup modal.
    toggleEditElectionModal();
})

// Recieve electionData for the page from the main Processs
ipcRenderer.on('loadElectionData', (event, arg: election.ElectionDataInterface) => {
    loadElection(arg);
})

// Image controls in the popup.
let imageBtn = <HTMLButtonElement>document.getElementById('imageBtn');
let imageInput = <HTMLInputElement>document.getElementById('imageInput');

// Warning, electionImagePreview is the <figure> elem, not the child <img> elem.
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

// Decide whether to preview the image or hide in case no image is was selected.
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

// Controls in the popup to change the Back Colour, and font colour.
let electionTitleColorBtn = document.getElementById('electionTitleColorBtn');
let electionBackColorBtn = document.getElementById('electionBackColorBtn');

function loadElection(data: election.ElectionDataInterface) {
    electionData = data;
    editTitle.innerHTML = data.name;
    editSubTitle.innerHTML = data.description;
}

// Set the current data values in the edit election popup.
function setModalData(data: election.ElectionDataInterface) {

    let inputData: HTMLInputElement;
    for (let i = 0; i < electionDataFields.length; i++) {
        inputData = <HTMLInputElement>electionDataFields[i];
        inputData.value = data[inputData.name]
    }
    let electionImage = <HTMLImageElement>electionImagePreview.firstElementChild;

    electionImage.src = data.image;
    electionImagePreview.style.display = 'block';

    electionBackColorBtn.style.backgroundColor = data.backColor;
    electionTitleColorBtn.style.backgroundColor = data.fontColor;
}