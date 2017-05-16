'use strict';

import * as election from '../model/election';

const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;

import * as shortid from "shortid";

import * as Popups from "./electionPopup"

let electionName = document.getElementById('electionTitle');
let electionDescription = document.getElementById('electionSubTitle');
let electionImage = <HTMLImageElement>document.getElementById('electionImage');
let editElectionBtn = document.getElementById('editElectionBtn');
let editElectionModal = document.getElementById('editElection');
let infoInputHeading = document.getElementById('infoInputHeading');
let electionModalTitle = document.getElementById('electionModalTitle');
let closeEditElection = document.getElementById('closeEditElection');
let saveEditElection = document.getElementById('saveEditElection');
let electionInputFields = document.getElementsByClassName('electionData');
let electionImageInput = <HTMLInputElement>document.getElementById('electionImageInput');
let electionImgPreview = document.getElementById('electionImgPreview');
let electionImageBtn = document.getElementById('electionImageBtn');
let electionBackColorBtn = document.getElementById('electionBackColorBtn');
let electionTitleColorBtn = document.getElementById('electionTitleColorBtn');
let electionColorBtns = [electionBackColorBtn, electionTitleColorBtn];

let newOfficeBtn = document.getElementById('newOfficeBtn');

let officeContainer = document.getElementById('offices');
let officeTemplate = document.getElementById('officeTemplate').innerHTML;

let candListModal = document.getElementById('candidatesModal');
let candListTitle = document.getElementById('candidatesTitle');
let candListOpenBtn: HTMLElement; // This varies based on which office it is joint to.
let candListCloseBtn = document.getElementById('closeCandidateList');

let candModal = document.getElementById('candidateEditModal');
let candModalOpenBtn = document.getElementById('addCandidate');
let candModalCloseBtn = document.getElementById('closeCandidateEditBtn');
let candModalSaveBtn = document.getElementById('saveEditCandidate');
let candTitle = document.getElementById('editCandidateTitle');
let candInputFields = document.getElementsByClassName('candidateData');
let candImageInput = <HTMLInputElement>document.getElementById('candidateImageInput');
let candImagePreview = document.getElementById('candidateImgPreview');
let candImageBtn = document.getElementById('candidateImageBtn');
let candColorBtns = []; // No BackColor/ Font Color Btns for candidates.

let candidatesContainer = document.getElementById('candidateList');
let candidateTemplate = document.getElementById('candidateTemplate').innerHTML;

let electionImgElem = <HTMLImageElement>electionImgPreview.firstElementChild;

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

electionImageBtn.addEventListener('click', () => {
    let initalValue = electionImageInput.value;
    let imagePath: string[] = openImageSelect();
    previewImage(imagePath, electionImgPreview, electionImageInput, initalValue);
})

candImageBtn.addEventListener('click',()=> {
    let initalValue = candImageInput.value;
    let imagePath: string[] = openImageSelect();
    previewImage(imagePath,candImagePreview,candImageInput,initalValue);
})

// Recieve electionData for the page from the main Processs
ipcRenderer.on('loadElectionData', (event, arg: election.ElectionDataInterface) => {
    loadElection(arg);
})


function loadElection(data: election.ElectionDataInterface) {
    let electionPopupHeadings: election.popupHeadings = { infoInputHeading: infoInputHeading, electionModalTitle: electionModalTitle };
    let editControls: election.editControls = {
        modal: editElectionModal,
        openBtn: editElectionBtn,
        closeBtn: closeEditElection,
        saveBtn: saveEditElection,
        inputFields: electionInputFields,
        imagePreview: electionImgPreview,
        colorBtns: electionColorBtns
    }

    let electionCard = new Popups.ElectionCard(data,
        electionName,
        electionDescription,
        electionImage,
        electionPopupHeadings,
        editControls
    )

    let newOfficeControls = { ...editControls };
    newOfficeControls.openBtn = newOfficeBtn;

    let candListControls: election.popupControls = { modal: candListModal, openBtn: candListOpenBtn, closeBtn: candListCloseBtn };

    let candPopupControls: election.editControls = {
        modal: candModal,
        openBtn: candModalOpenBtn,
        closeBtn: candModalCloseBtn,
        saveBtn: candModalSaveBtn,
        inputFields: candInputFields,
        imagePreview: candImagePreview,
        colorBtns: candColorBtns
    }

    let addOfficePopup = new Popups.newOfficePopup(data,
        electionPopupHeadings,
        newOfficeControls,
        officeContainer,
        officeTemplate,
        candListTitle,
        candListControls,
        candTitle,
        candPopupControls,
        candidatesContainer,
        candidateTemplate);

    for (let i = 0; i < data.offices.length; i++) {
        let officeControls = { ...editControls };

        new Popups.OfficeCard(data,
            officeContainer,
            officeTemplate,
            data.offices[i],
            officeControls,
            electionPopupHeadings,
            candListControls,
            candListTitle,
            candPopupControls,
            candTitle,
            candidatesContainer,
            candidateTemplate);
    }
}



