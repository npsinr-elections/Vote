import * as election from '../model/election';
import * as shortid from 'shortid';
const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;

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

export class Popup<T extends election.ElectionDataInterface | election.officeDataInterface | election.candidateDataInterface> {
    protected imgElem: HTMLImageElement;
    private modal: HTMLElement;
    private openBtn: HTMLElement;
    private closeBtn: HTMLElement;
    protected saveBtn: HTMLElement;
    private inputFields: HTMLCollection;
    private imageInputField: HTMLInputElement;
    private imagePreview: HTMLElement;
    private colorBtns: HTMLElement[];
    private imageBtn: HTMLElement;

    constructor(protected electionData: election.ElectionDataInterface,
        protected modalData: T,
        { modal, openBtn, closeBtn, saveBtn, inputFields, imageInputField, imagePreview, colorBtns, imageBtn }: election.editControls) {

        this.modal = modal;
        this.closeBtn = closeBtn;
        this.saveBtn = saveBtn;
        this.inputFields = inputFields;
        this.imageInputField = imageInputField;
        this.imagePreview = imagePreview;
        this.colorBtns = colorBtns;
        this.imageBtn = imageBtn;

        this.imgElem = <HTMLImageElement>imagePreview.firstElementChild;
        imageBtn.addEventListener('click', () => {
            let imagePath: string[] = openImageSelect();
            previewImage(imagePath, imagePreview, imageInputField, this.modalData.image);
        })

        saveBtn.addEventListener('click', () => {
            this.saveInputData();
        })

        openBtn.addEventListener('click', ()=> {
            this.openPopup();
        })

        closeBtn.addEventListener('click', () => {
            this.togglePopup();
        })
    }

    private openPopup() {
        this.setHeadings(); // Set the text messages on the popup.
        this.setModalData(); // Set the text fields with data.
        this.togglePopup(); // Show the popup
    }

    protected setHeadings() {

    }

    togglePopup() {
        this.modal.classList.toggle('is-active');
    }


    resetData() {
        let inputData: HTMLInputElement;

        // Reset all the input Fields.
        for (let i = 0; i < this.inputFields.length; i++) {
            inputData = <HTMLInputElement>this.inputFields[i];
            inputData.value = '';
        }


        this.imagePreview.style.display = 'none';
        this.imgElem.src = '';

        // Reset the color picker buttons.
        if (this.colorBtns) {
            for (let i = 0; i < this.colorBtns.length; i++) {
                this.colorBtns[i].style.backgroundColor = '';
                this.colorBtns[i].style.color = '';
            }
        }
    }

    setModalData() {
        let inputData: HTMLInputElement;
        let changeEvent = new Event('input', { bubbles: true });

        // Set the input data on each element, and fire the change event on each (Mainly for jscolor to update button style.)
        for (let i = 0; i < this.inputFields.length; i++) {
            inputData = <HTMLInputElement>this.inputFields[i];
            inputData.value = this.modalData[inputData.name]
            inputData.dispatchEvent(changeEvent);
        }


        this.imgElem.src = this.modalData.image;
        this.imagePreview.style.display = 'block';
    }

    getInputData() {
        let inputData: HTMLInputElement;
        let collectData = <Object>{};

        // Check if fields are not blank
        for (let i = 0; i < this.inputFields.length; i++) {
            inputData = <HTMLInputElement>this.inputFields[i];
            if (inputData.value.replace(/\s/g, "").length == 0) {
                dialog.showErrorBox("Some data wasn't entered...", 'Please fill all the fields!');
                return;
            }
            collectData[inputData.name] = inputData.value;
        }

        // All field were valid, now store the data

        for (let key in collectData) {
            if (collectData.hasOwnProperty(key)) {
                this.modalData[key] = collectData[key];
            }
        }

    }

    saveInputData() {
        this.getInputData();
        this.updateData();
        saveElectionData(this.electionData);
        this.updateInterface();
        this.togglePopup(); // Close the popup
    }

    updateData() {
        // Child classes can ovverride this to add data to electionData before it is saved.
    }

    updateInterface() {
        // Child classes can override this to configure interfaces and data after the election has been saved.
    }
}








function saveElectionData(electionData) {
    // Ask the main Process to save the Data, display success message
    let result = ipcRenderer.sendSync('saveElectionData', electionData);
    // ONLY FOR DEBUGGING:
    if (result == 'Saved') {
        let loadAsk = dialog.showMessageBox({ type: 'info', message: 'Success', buttons: ['Ok'], detail: "All changes have been saved." })
    }
}

class DataPopup<K extends election.ElectionDataInterface | election.officeDataInterface> extends Popup<K> {
    private infoInputHeading: HTMLElement;
    private electionModalTitle: HTMLElement;

    constructor(electionData: election.ElectionDataInterface,
        modalData: K,
        { infoInputHeading, electionModalTitle }: election.popupHeadings,
        private modalTitle: string,
        private inputHeadingMessage: string,
        private saveButtonMessage: string,
        editControls: election.editControls) {

        super(electionData,
            modalData,
            editControls);

    }


    protected setHeadings() {
        this.infoInputHeading.innerHTML = this.inputHeadingMessage;
        this.electionModalTitle.innerHTML = this.modalTitle
        this.saveBtn.children[1].innerHTML = this.saveButtonMessage;
    }

}


export class editElectionPopup extends DataPopup<election.ElectionDataInterface> {
    constructor(protected electionData: election.ElectionDataInterface,
        popupHeadings: election.popupHeadings,
        editControls: election.editControls,
        private electionCard: ElectionCard) {

        super(electionData,
            electionData,
            popupHeadings,
            'Edit Election: ' + electionData.name, //modalTitle
            "What is your election called?", //inputHeadingMessage
            "Save Changes",//saveButtonMessage
            editControls);
    }

    updateInterface() {
        this.electionCard.updateInterface(this.electionData.name, this.electionData.description);
    }
}

class newOfficePopup extends DataPopup<election.officeDataInterface> { // any because a new office always initially has no data.
    constructor(electionData: election.ElectionDataInterface,
        private popupHeadings: election.popupHeadings,
        private editControls: election.editControls, // This class needs editControls to create editOfficePopup objects.
        private officeContainer: HTMLElement,
        private officeTemplate: string,
        private candListTitle: HTMLElement,
        private candListPopupControls: election.popupControls,
        private candTitle: HTMLElement,
        private candPopupControls: election.editControls,
        private candidateContainer: HTMLElement,
        private candidateTemplate: string) {

        super(electionData,
            newOfficeObject(),
            popupHeadings,
            "Create New office", // modalTitle
            "What is this office called?", // inputHeadingMessage
            "Save changes", // saveButtonMessage
            editControls);
    }


    updateData() {
        this.modalData.id = shortid.generate();
        this.electionData.offices.push(this.modalData);
    }

    updateInterface() {
        createOfficeCard(this.electionData,
            this.officeContainer,
            this.officeTemplate,
            this.modalData,
            this.editControls,
            this.popupHeadings,
            this.candListPopupControls,
            this.candListTitle,
            this.candPopupControls,
            this.candTitle,
            this.candidateContainer,
            this.candidateTemplate)

        this.modalData = newOfficeObject();
    }
}

function newOfficeObject(): election.officeDataInterface {
    return { id: '', name: '', description: '', image: '', backColor: '', fontColor: '', candidates: [] };
}

function createOfficeCard(electionData: election.ElectionDataInterface,
    officeContainer: HTMLElement,
    officeTemplate: string,
    officeData: election.officeDataInterface,
    editControls: election.editControls,
    popupHeadings: election.popupHeadings,
    candListPopupControls: election.popupControls,
    candListTitle: HTMLElement,
    candPopupControls: election.editControls,
    candTitle: HTMLElement,
    candidateContainer: HTMLElement,
    candidateTemplate: string) {

    officeContainer.innerHTML += renderTemplate(officeTemplate, officeData);

    // Create the new Office Card Object.
    let officeCard = new OfficeCard(officeData.id);

    // Handles for Editing the Office
    let editControlsCopy = { ...editControls }; // Create a shallow copy to prevent mutability problems.
    editControlsCopy.openBtn = officeCard.editBtn;

    let thisOfficePopup = new editOfficePopup(electionData,
        officeData,
        popupHeadings,
        editControlsCopy,
        officeCard);

    // Handle for deleting the office.
    officeCard.deleteBtn.addEventListener('click', () => {
        electionData.offices.splice(electionData.offices.indexOf(officeData), 1);
    })

    // Handles for viewing the candidates of the office
    let candListPopupControlsCopy = { ...candListPopupControls };
    candListPopupControlsCopy.openBtn = officeCard.candidatesBtn;

    let thisOfficeCandidatesPopup = new candidatesListPopup(electionData,
        officeData,
        candListTitle,
        candListPopupControlsCopy,
        candTitle,
        candPopupControls,
        candidateContainer,
        candidateTemplate);
}

function newCandidateObject(): election.candidateDataInterface {
    return { id: '', name: '', image: '' };
}

class candidatesListPopup { // A special popup for showing a list of candidates for an office.
    private modalData: election.candidateDataInterface[];
    private newCandidatePopup: newCandidatePopup;
    constructor(private electionData: election.ElectionDataInterface,
        private officeData: election.officeDataInterface,
        private candListTitle: HTMLElement,
        private candListPopupControls: election.popupControls,
        private candTitle: HTMLElement,
        private candPopupControls: election.editControls,
        private candidateContainer: HTMLElement,
        private candidateTemplate: string) {

        this.modalData = officeData.candidates;

        candListPopupControls.openBtn.addEventListener('click', () => {
            this.setHeadings();
            this.setModalData();
            this.toggleModal();
        })

        this.newCandidatePopup = new newCandidatePopup(electionData,
            officeData,
            candTitle,
            candPopupControls,
            candidateContainer,
            candidateTemplate)
    }

    toggleModal() {
        this.candListPopupControls.modal.classList.toggle('is-active');
    }

    setHeadings() {
        this.candListTitle.innerHTML = this.officeData.name + ' Candidates';
    }

    setModalData() {
        this.candidateContainer.innerHTML = "";
        for (let i = 0; i < this.modalData.length; i++) {
            createCandidateCard(this.electionData,
            this.candidateContainer,
            this.candidateTemplate,
            this.officeData,
            this.modalData[i],
            this.candPopupControls,
            this.candTitle)

        }
    }
}

class newCandidatePopup extends Popup<election.candidateDataInterface> {
    constructor(electionData: election.ElectionDataInterface,
        private officeData: election.officeDataInterface,
        private candTitle: HTMLElement,
        private editControls: election.editControls,
        private candidateContainer: HTMLElement,
        private candidateTemplate: string) {
        super(electionData,
            newCandidateObject(),
            editControls)
    }

    updateData() {
        this.modalData.id = shortid.generate();
        this.officeData.candidates.push(this.modalData);
    }

    protected setHeadings() {
        this.candTitle.innerHTML = 'New Candidate';
    }

    updateInterface() {
        createCandidateCard(this.electionData,
        this.candidateContainer,
        this.candidateTemplate,
        this.officeData,
        this.modalData,
        this.editControls,
        this.candTitle)

        this.modalData = newCandidateObject();
    }
}

function createCandidateCard(electionData: election.ElectionDataInterface,
    candidateContainer: HTMLElement,
    candidateTemplate: string,
    officeData: election.officeDataInterface,
    candidateData: election.candidateDataInterface,
    editControls: election.editControls,
    candTitle: HTMLElement) {
    candidateContainer.innerHTML += renderTemplate(candidateTemplate, candidateData);

    let candidateCard = new CandidateCard(candidateData.id);

    let editControlsCopy = { ...editControls };
    editControlsCopy.openBtn = candidateCard.editBtn;

    let thisCandidatePopup = new editCandidatePopup(electionData,
        candidateData,
        candTitle,
        editControlsCopy,
        candidateCard)

    candidateCard.deleteBtn.addEventListener('click', () => {
        officeData.candidates.splice(officeData.candidates.indexOf(candidateData), 1);
    })
}
class editCandidatePopup extends Popup<election.candidateDataInterface> {
    constructor(electionData: election.ElectionDataInterface,
        modalData: election.candidateDataInterface,
        candTitle: HTMLElement,
        editControls: election.editControls,
        private candidateCard: CandidateCard) {
        super(electionData, modalData, editControls)
    }

    updateInterface() {
        this.candidateCard.updateInterface(this.modalData.name);
    }
}

class Card {
    private card: HTMLElement;
    private name: HTMLElement;
    public editBtn: HTMLElement;

    constructor(id: string) {
        this.card = document.getElementById(id);
        this.name = document.getElementById(id + '-name');

        this.editBtn = document.getElementById(id + '-edit');
    }

    updateInterface(name, ...args: string[]) {
        this.name.innerHTML = name;
        this.updateSpecifics(...args)
    }

    updateSpecifics(...args: string[]) {

    }
}

class OfficeCard extends Card {
    public deleteBtn: HTMLElement;
    public candidatesBtn: HTMLElement;
    private description: HTMLElement;

    constructor(id: string) {
        super(id);
        this.deleteBtn = document.getElementById(id + '-delete');
        this.candidatesBtn = document.getElementById(id + '-candidates');
        this.description = document.getElementById(id + '-description');
    }

    updateSpecifics(description) {
        this.description = description;
    }


}

export class ElectionCard extends Card {
    private description: HTMLElement;

    constructor(id: string) {
        super(id);
        this.description = document.getElementById(id + '-description');
    }

    updateSpecifics(description) {
        this.description = description;
    }


}

class CandidateCard extends Card {
    public deleteBtn: HTMLElement;

    constructor(id: string) {
        super(id);
        this.deleteBtn = document.getElementById(id + '-delete');
    }

}


class editOfficePopup extends DataPopup<election.officeDataInterface> {
    private officeCard: Card;
    constructor(electionData: election.ElectionDataInterface,
        modalData: election.officeDataInterface,
        popupHeadings: election.popupHeadings,
        editControls: election.editControls,
        officeCard: OfficeCard) {
        super(electionData,
            modalData,
            popupHeadings,
            "Edit Office: " + modalData.name, // modalTitle
            "What is this office called?", // inputHeadingMessage
            "Save changes", // saveButtonMessage
            editControls);
    }

    updateInterface() {
        this.officeCard.updateInterface(this.modalData.name, this.modalData.description);
    }
}

function renderTemplate(template: string, data) {
    // Search for substrings of the form {{attribute}} in template, and replace them with data.attribute.
    return template.replace(/{{(\w+)}}/g, function (match, p1): string {
        return data[p1] || match;
    })
}


