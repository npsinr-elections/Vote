'use strict';

import * as election from '../model/election';

const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;

import * as shortid from "shortid";

let electionData: election.ElectionDataInterface = null; // The current electionData Object for this window.
let currentModalData = null; // The data currently in the popup election Modal.
let currentOfficeObject = null;
let modalAction = null;

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
let infoInputHeading = document.getElementById('infoInputHeading');

let officeContainer = document.getElementById('offices');
let officeTemplate = document.getElementById('officeTemplate').innerHTML;

let candidateTemplate = document.getElementById('candidateTemplate').innerHTML;

let candidatesModal = document.getElementById('candidatesModal');
let candidatesTitle = document.getElementById('candidatesTitle');
let candidatesContainer = document.getElementById('candidateList');
let closeCandidateList = document.getElementById('closeCandidateList');

let addCandidateBtn = document.getElementById('addCandidate');

let candidateEditModal = document.getElementById('candidateEditModal');
let editCandidateTitle = document.getElementById('editCandidateTitle');
let candidateNameInput = <HTMLInputElement>document.getElementById('candidateName');
let candidateImageInput = <HTMLInputElement>document.getElementById('candidateImage');
let saveEditCandidate = document.getElementById('saveEditCandidate');
let candidateImageBtn = document.getElementById('candidateImageBtn');
let closeCandidateEditBtn = document.getElementById('closeCandidateEditBtn');

let addOfficeBtn = document.getElementById('addOfficeBtn');

export function editCandidate(editBtn: HTMLElement, id: string) {
    let candidateObj = <election.candidateDataInterface>election.getCandidateById(id, currentOfficeObject);

    editCandidateTitle.innerHTML = "Edit: " + candidateObj.name;
    candidateNameInput.value = candidateObj.name;
    candidateImageInput.value = candidateObj.image;
    let imgPreview = <HTMLImageElement>candidateImagePreview.firstElementChild;
    imgPreview.src = candidateObj.image;
    candidateImagePreview.style.display = 'block';
    modalAction = "editCandidate";
    currentModalData = candidateObj;
    toggleCandidateEditModal();
}

export function deleteCandidate(deleteBtn: HTMLElement, id: string) {
    let candidateObj = <election.candidateDataInterface>election.getCandidateById(id, currentOfficeObject);

    let confirm = dialog.showMessageBox({ type: 'warning', buttons: ['Yes', 'No'], title: 'Confirm Action', message: 'Are you sure you want to delete the candidate: ' + candidateObj.name + '?', detail: 'This action cannot be reversed.' });
    if (confirm == 0) {
        let candidateCard = deleteBtn.parentElement.parentElement;
        currentOfficeObject.candidates.splice(currentOfficeObject.candidates.indexOf(candidateObj), 1)
        candidatesContainer.removeChild(candidateCard);
        saveElectionData();
    }
}

addOfficeBtn.addEventListener('click', function () {
    openEditOfficeInfo({ id: shortid.generate(), candidates: [] }, true);
})

addCandidateBtn.addEventListener('click', function () {
    editCandidateTitle.innerHTML = "Create a new candidate";
    candidateNameInput.value = "";
    candidateImageInput.value = "";
    candidateImagePreview.style.display = 'none';
    modalAction = "newCandidate";
    currentModalData = { id: shortid.generate() };
    toggleCandidateEditModal();
})

saveEditCandidate.addEventListener('click', function () {
    let candidateName = candidateNameInput.value;
    let candidateImage = candidateImageInput.value;

    if (candidateName.replace(/\s/g, "").length == 0) {
        dialog.showErrorBox("Some data wasn't entered...", 'Please fill all the fields!');
        return;
    }

    currentModalData.name = candidateName;
    currentModalData.image = candidateImage;

    if (modalAction == 'newCandidate') {
        currentOfficeObject.candidates.push(currentModalData);
        candidatesContainer.innerHTML += renderTemplate(candidateTemplate, currentModalData);
    } else if (modalAction == 'editCandidate') {
        let candidateName = document.getElementById(currentModalData.id + '-name');
        candidateName.innerHTML = currentModalData.name;
    }

    toggleCandidateEditModal();
    saveElectionData();
})
// View/Hide the election popup modal
function toggleEditElectionModal() {
    editElectionModal.classList.toggle('is-active');
}

function toggleCandidatesModal() {
    candidatesModal.classList.toggle('is-active');
}

function toggleCandidateEditModal() {
    candidateEditModal.classList.toggle('is-active');
}

closeCandidateEditBtn.addEventListener('click', function () {
    toggleCandidateEditModal();
})

closeCandidateList.addEventListener('click', function () {
    toggleCandidatesModal();
})

export function editOffice(editButton: HTMLElement, id: string) {
    let officeObject = <election.officeDataInterface>election.getOfficeById(id, electionData.offices);
    openEditOfficeInfo(officeObject);
}

export function deleteOffice(deleteButton: HTMLElement, id: string) {
    let officeObject = <election.officeDataInterface>election.getOfficeById(id, electionData.offices);
    let confirm = dialog.showMessageBox({ type: 'warning', buttons: ['Yes', 'No'], title: 'Confirm Action', message: 'Are you sure you want to delete the office: ' + officeObject.name + '?', detail: 'This action cannot be reversed.' });
    if (confirm == 0) {
        electionData.offices.splice(electionData.offices.indexOf(officeObject), 1);
        console.log(electionData.offices);
        let officeCard = deleteButton.parentElement.parentElement;
        officeContainer.removeChild(officeCard);
        saveElectionData();
    }
}

export function openCandidatesModal(modalButton: HTMLElement, id: string) {
    let officeObject = <election.officeDataInterface>election.getOfficeById(id, electionData.offices);
    candidatesContainer.innerHTML = "";
    candidatesTitle.innerHTML = officeObject.name + " Candidates";

    for (let i = 0; i < officeObject.candidates.length; i++) {
        candidatesContainer.innerHTML += renderTemplate(candidateTemplate, officeObject.candidates[i]);
    }

    modalAction = "listCandidates";
    currentOfficeObject = officeObject;
    toggleCandidatesModal();
}
// Open the popup modal to edit the Election's top-level data.
function openEditElectionInfo() {
    infoInputHeading.innerHTML = "What is your Election called?";
    modalAction = "editElection";
    electionModalTitle.innerHTML = "Edit Election: " + electionData.name;
    setModalData(electionData);
    currentModalData = electionData;
    saveEditElection.children[1].innerHTML = 'Save Changes';
    toggleEditElectionModal();
}

// Open the popup modal to edit a specific election's data.
function openEditOfficeInfo(data, newOffice = false) {
    infoInputHeading.innerHTML = "Which office is this?";
    if (newOffice) {
        modalAction = "newOffice";
        electionModalTitle.innerHTML = 'Create New Office';
        saveEditElection.children[1].innerHTML = "Create New Office";
        currentModalData = data;
        resetEditElectionModal();
    } else {
        modalAction = "editOffice";
        electionModalTitle.innerHTML = 'Edit Office: ' + data.name;
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

    switch (modalAction) {
        case "editElection":
            editTitle.innerHTML = electionData.name;
            editSubTitle.innerHTML = electionData.description;
            break;
        case "newOffice":
            officeContainer.innerHTML += renderTemplate(officeTemplate, currentModalData);
            console.log(currentModalData);
            electionData.offices.push(currentModalData);
            break;
        case "editOffice":
            let officeName = document.getElementById(currentModalData.id + '-name');
            let officeDesc = document.getElementById(currentModalData.id + '-description');
            console.log(currentModalData);
            officeName.innerHTML = currentModalData.name;
            officeDesc.innerHTML = currentModalData.description;
            break;
    }

    saveElectionData();

    // Close the popup modal.
    toggleEditElectionModal();
})

function saveElectionData() {
    // Ask the main Process to save the Data, display success message
    let result = ipcRenderer.sendSync('saveElectionData', electionData);
    // ONLY FOR DEBUGGING:
    if (result == 'Saved') {
        let loadAsk = dialog.showMessageBox({ type: 'info', message: 'Success', buttons: ['Ok'], detail: "All changes have been saved." })
    }
}

// Recieve electionData for the page from the main Processs
ipcRenderer.on('loadElectionData', (event, arg: election.ElectionDataInterface) => {
    loadElection(arg);
})

// Image controls in the popup.
let imageBtn = <HTMLButtonElement>document.getElementById('imageBtn');
let imageInput = <HTMLInputElement>document.getElementById('imageInput');

// Warning, electionImagePreview is the <figure> elem, not the child <img> elem.
let electionImagePreview = document.getElementById('electionImgPreview');

let candidateImagePreview = document.getElementById('candidateImgPreview');

// Open file explorer window to select image.
imageBtn.addEventListener('click', () => {
    let imagePath: string[] = openImageSelect();
    previewImage(imagePath, electionImagePreview, imageInput, currentModalData.image);
})

candidateImageBtn.addEventListener('click', () => {
    let imagePath: string[] = openImageSelect();
    previewImage(imagePath, candidateImagePreview, candidateImageInput, currentModalData.image);
})

function openImageSelect() {
    let imagePath: string[] = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
    })
    return imagePath;
}

// Decide whether to preview the image or hide in case no image is was selected.
function previewImage(imagePath, imagePreview, imageInput, initalValue = '') {
    let previewImage = imagePreview.firstElementChild;
    if (typeof imagePath != 'undefined') {
        imageInput.value = imagePath[0];
        previewImage.src = imagePath[0];
        imagePreview.style.display = 'block';
    } else {
        imageInput.value = initalValue;
        if (initalValue == '' || initalValue == undefined) {
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
    for (let i = 0; i < electionData.offices.length; i++) {
        officeContainer.innerHTML += renderTemplate(officeTemplate, electionData.offices[i]);
    }
}

// Set the current data values in the edit election popup.
function setModalData(data: election.ElectionDataInterface) {

    let inputData: HTMLInputElement;
    let changeEvent = new Event('input', { bubbles: true });

    for (let i = 0; i < electionDataFields.length; i++) {
        inputData = <HTMLInputElement>electionDataFields[i];
        inputData.value = data[inputData.name]
        inputData.dispatchEvent(changeEvent);
    }
    let electionImage = <HTMLImageElement>electionImagePreview.firstElementChild;

    electionImage.src = data.image;
    electionImagePreview.style.display = 'block';
}

function renderTemplate(template: string, data) {
    // Search for substrings of the form {{attribute}} in template, and replace them with data.attribute.
    return template.replace(/{{(\w+)}}/g, function (match, p1): string {
        return data[p1] || match;
    })
}