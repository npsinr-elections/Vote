import * as election from '../model/election';
import * as shortid from 'shortid';
const { remote, ipcRenderer }: { remote: Electron.Remote, ipcRenderer: Electron.IpcRenderer } = require('electron')
const { dialog }: { dialog: Electron.Dialog } = remote;




export class Popup<T extends election.ElectionDataInterface | election.officeDataInterface | election.candidateDataInterface> {
    protected imgElem: HTMLImageElement;
    private modal: HTMLElement;
    private openBtn: HTMLElement;
    private closeBtn: HTMLElement;
    protected saveBtn: HTMLElement;
    private inputFields: HTMLCollection;
    private imagePreview: HTMLElement;
    private colorBtns: HTMLElement[];

    private saveFunc: EventListenerOrEventListenerObject;
    private openFunc: EventListenerOrEventListenerObject;
    private closeFunc: EventListenerOrEventListenerObject;


    constructor(protected electionData: election.ElectionDataInterface,
        protected modalData: T,
        { modal, openBtn, closeBtn, saveBtn, imagePreview, inputFields, colorBtns }: election.editControls) {

        this.modal = modal;
        this.closeBtn = closeBtn;
        this.saveBtn = saveBtn;
        this.inputFields = inputFields;
        this.colorBtns = colorBtns;
        this.imagePreview = imagePreview;
        this.openBtn = openBtn;
        this.imgElem = <HTMLImageElement>imagePreview.firstElementChild;

        this.openFunc = this.openPopup.bind(this);
        this.openBtn.addEventListener('click', this.openFunc);
    }


    private openPopup() {
        this.setHeadings(); // Set the text messages on the popup.
        this.setModalData(); // Set the text fields with data.
        this.togglePopup(); // Show the popup

        // It is necessary to follow this structure of event listener binding,
        // as the same popup DOM Object is being used for multiple tasks. Thus,
        // each time a popup opens, it must bind the event listeners it needs,
        // and when it closes, it must remove these as well.

        this.saveFunc = this.saveInputData.bind(this);
        this.closeFunc = this.closePopup.bind(this);
        this.saveBtn.addEventListener('click', this.saveFunc);
        this.closeBtn.addEventListener('click', this.closeFunc);
    }


    private closePopup() {
        this.saveBtn.removeEventListener('click', this.saveFunc);
        this.closeBtn.removeEventListener('click', this.closeFunc);
        this.togglePopup()
    }


    protected setHeadings() {

    }


    public cleanUp() {
        // The newCandidate modal requires a clean up of its open event listener when the
        // candidateList modal is closed.
        this.openBtn.removeEventListener('click', this.openFunc);
    }


    togglePopup() {
        // This method takes advantage of the fact that the open modal buttons show only
        // when the modal is closed, and the close modal button shows only when the modal button
        // is showing. Thus it can be used as a dual purpose method, for opening and closing.
        this.modal.classList.toggle('is-active');
    }


    setModalData() {
        let inputData: HTMLInputElement;
        let changeEvent = new Event('input', { bubbles: true });

        // Reset the color picker buttons.
        if (this.colorBtns) {
            for (let i = 0; i < this.colorBtns.length; i++) {
                this.colorBtns[i].style.backgroundColor = '';
                this.colorBtns[i].style.color = '';
            }
        }

        // Set the input data on each element, and fire the change event on each (Mainly for jscolor to update button style.)
        for (let i = 0; i < this.inputFields.length; i++) {
            inputData = <HTMLInputElement>this.inputFields[i];
            inputData.value = this.modalData[inputData.name]
            inputData.dispatchEvent(changeEvent);
        }

        this.imgElem.src = this.modalData.image;

        if (this.modalData.image !== '') {
            this.imagePreview.style.display = 'block';
        } else {
            this.imagePreview.style.display = 'none';
        }
    }


    getInputData() {
        let inputData: HTMLInputElement;
        let collectData = <Object>{};

        // Check if fields are not blank
        for (let i = 0; i < this.inputFields.length; i++) {
            inputData = <HTMLInputElement>this.inputFields[i];
            if (inputData.value.replace(/\s/g, "").length == 0) {
                dialog.showErrorBox("Some data wasn't entered...", 'Please fill all the fields!');
                return false;
            }
            collectData[inputData.name] = inputData.value;
        }

        // All field were valid, now store the data

        for (let key in collectData) {
            if (collectData.hasOwnProperty(key)) {
                this.modalData[key] = collectData[key];
            }
        }

        return true;

    }


    saveInputData() {
        if (this.getInputData()) {
            this.updateData();
            saveElectionData(this.electionData);
            this.updateInterface();
            this.closePopup(); // Close the popup
        }
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




// The DataPopup class is a super class for election edit popups, new office popups, and edit office popups
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

        this.infoInputHeading = infoInputHeading;
        this.electionModalTitle = electionModalTitle;
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
        this.electionCard.updateInterface();
    }
}





export class newOfficePopup extends DataPopup<election.officeDataInterface> {
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
        let createNewOfficeCard = new OfficeCard(this.electionData,
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





function newCandidateObject(): election.candidateDataInterface {
    return { id: '', name: '', image: '' };
}




class candidatesListPopup { // A special popup for showing a list of candidates for an office.
    private modalData: election.candidateDataInterface[];
    private newCandidatePopup: newCandidatePopup;
    private closeFunc: EventListenerOrEventListenerObject;

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
            this.openPopup();
        })
    }


    openPopup() {
        this.setHeadings();
        this.setModalData();

        this.newCandidatePopup = new newCandidatePopup(this.electionData,
            this.officeData,
            this.candTitle,
            this.candPopupControls,
            this.candidateContainer,
            this.candidateTemplate);

        this.closeFunc = this.closePopup.bind(this);
        this.candListPopupControls.closeBtn.addEventListener('click', this.closeFunc);

        this.toggleModal();
    }


    closePopup() {
        this.candListPopupControls.closeBtn.removeEventListener('click', this.closeFunc);
        this.newCandidatePopup.cleanUp(); // Remove the addCandidate event listener.
        this.newCandidatePopup = null; // Remove reference to newCandidatePopup.
        this.toggleModal();
        this.candidateContainer.innerHTML = ""; // Clear the candidatesContainer.
    }


    toggleModal() {
        this.candListPopupControls.modal.classList.toggle('is-active');
    }

    
    setHeadings() {
        this.candListTitle.innerHTML = this.officeData.name + ' Candidates';
    }

    
    setModalData() {
        for (let i = 0; i < this.modalData.length; i++) {
            new CandidateCard(this.electionData,
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
        new CandidateCard(this.electionData,
            this.candidateContainer,
            this.candidateTemplate,
            this.officeData,
            this.modalData,
            this.editControls,
            this.candTitle)

        this.modalData = newCandidateObject();
    }
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
        this.candidateCard.updateInterface();
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

        this.officeCard = officeCard;
    }

    updateInterface() {
        this.officeCard.updateInterface();
    }
}


// Interface CARDS:



class Card {
    protected card: HTMLElement;
    private name: HTMLElement;
    public editBtn: HTMLElement;
    private imageElem:HTMLImageElement;

    constructor(private cardData: election.officeDataInterface | election.candidateDataInterface, protected container: HTMLElement, template: string) {
        let newCard = document.createElement('div');
        newCard.id = cardData.id;
        newCard.innerHTML = renderTemplate(template, cardData);

        container.appendChild(newCard);

        this.card = newCard;

        this.name = document.getElementById(cardData.id + '-name');

        this.editBtn = document.getElementById(cardData.id + '-edit');
        this.imageElem = <HTMLImageElement>document.getElementById(cardData.id + '-image');
    }


    updateInterface() {
        this.name.innerHTML = this.cardData.name;
        this.imageElem.src = this.cardData.image;
        this.updateSpecifics();
    }


    updateSpecifics() {

    }
}





export class OfficeCard extends Card {
    public deleteBtn: HTMLElement;
    public candidatesBtn: HTMLElement;
    private description: HTMLElement;

    constructor(electionData: election.ElectionDataInterface,
        officeContainer: HTMLElement,
        officeTemplate: string,
        private officeData: election.officeDataInterface,
        editControls: election.editControls,
        popupHeadings: election.popupHeadings,
        candListPopupControls: election.popupControls,
        candListTitle: HTMLElement,
        candPopupControls: election.editControls,
        candTitle: HTMLElement,
        candidateContainer: HTMLElement,
        candidateTemplate: string) {


        super(officeData, officeContainer, officeTemplate);

        this.deleteBtn = document.getElementById(officeData.id + '-delete'); // Delete Office Button
        this.candidatesBtn = document.getElementById(officeData.id + '-candidates'); // View Candidates Button

        this.description = document.getElementById(officeData.id + '-description'); // The description of the office.

        // Handles for Editing the Office
        let editControlsCopy = { ...editControls }; // Create a shallow copy to prevent mutability problems.
        editControlsCopy.openBtn = this.editBtn;


        let thisOfficePopup = new editOfficePopup(electionData,
            officeData,
            popupHeadings,
            editControlsCopy,
            this);


        // Handle for deleting the office.
        this.deleteBtn.addEventListener('click', () => {
            let confirm = dialog.showMessageBox({
                type: 'warning',
                buttons: ['Yes', 'No'],
                title: 'Confirm Action',
                message: 'Are you sure you want to delete the office: ' + officeData.name + '?',
                detail: 'This action cannot be reversed.'
            });

            if (confirm == 0) {
                electionData.offices.splice(electionData.offices.indexOf(officeData), 1);
                this.container.removeChild(this.card);
                saveElectionData(electionData);
            }
        })

        // Handles for viewing the candidates of the office
        let candListPopupControlsCopy = { ...candListPopupControls };
        candListPopupControlsCopy.openBtn = this.candidatesBtn;

        let thisOfficeCandidatesPopup = new candidatesListPopup(electionData,
            officeData,
            candListTitle,
            candListPopupControlsCopy,
            candTitle,
            candPopupControls,
            candidateContainer,
            candidateTemplate);
    }


    updateSpecifics() {
        this.description.innerHTML = this.officeData.description;
    }


}



export class ElectionCard { // The election card is a special card whose template has already been hardcoded in the DOM.
    private description: HTMLElement;

    constructor(private electionData: election.ElectionDataInterface,
        private electionName: HTMLElement,
        private electionDescription: HTMLElement,
        private electionImage:HTMLImageElement,
        popupHeadings: election.popupHeadings,
        editControls: election.editControls) {

        let editInfo = new editElectionPopup(electionData,
            popupHeadings,
            editControls,
            this)

        this.updateInterface();
    }


    updateInterface() {
        this.electionName.innerHTML = this.electionData.name;
        this.electionDescription.innerHTML = this.electionData.description;
        this.electionImage.src = this.electionData.image;
    }


}




class CandidateCard extends Card {
    public deleteBtn: HTMLElement;

    constructor(electionData: election.ElectionDataInterface,
        candidateContainer: HTMLElement,
        candidateTemplate: string,
        officeData: election.officeDataInterface,
        private candidateData: election.candidateDataInterface,
        editControls: election.editControls,
        candTitle: HTMLElement) {

        super(candidateData, candidateContainer, candidateTemplate)

        this.deleteBtn = document.getElementById(candidateData.id + '-delete');

        let editControlsCopy = { ...editControls };
        editControlsCopy.openBtn = this.editBtn;

        let thisCandidatePopup = new editCandidatePopup(electionData,
            candidateData,
            candTitle,
            editControlsCopy,
            this)

        this.deleteBtn.addEventListener('click', () => {
            let confirm = dialog.showMessageBox({
                type: 'warning',
                buttons: ['Yes', 'No'],
                title: 'Confirm Action',
                message: 'Are you sure you want to remove: ' + candidateData.name + '?',
                detail: 'This action cannot be reversed.'
            });

            if (confirm == 0) {
                officeData.candidates.splice(officeData.candidates.indexOf(candidateData), 1);
                this.container.removeChild(this.card);
                saveElectionData(electionData);
            }
        })
    }


    updateSpecifics() {
        // No specifics for candidates, just the name!
    }

}



function renderTemplate(template: string, data) {
    // Search for substrings of the form {{attribute}} in template, and replace them with data.attribute.
    return template.replace(/{{(\w+)}}/g, function (match, p1): string {
        return data[p1] || match;
    })
}


