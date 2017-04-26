'use strict';

const {remote, ipcRenderer}:{remote:Electron.Remote, ipcRenderer:Electron.IpcRenderer} = require('electron')
const {dialog}:{dialog:Electron.Dialog} = remote;

interface newElectionInterface {
    // Describes a newly created election object
    name:string;
    description:string;
    image:string;
    backColor:string;
    fontColor:string;
    [propname: string] :string;
}

let newElectionModal = <HTMLDivElement>document.getElementById('newElection');
// Show new election modal popup.
function toggleNewElection() {
    newElectionModal.classList.toggle('is-active');
}

let newElectionBtn = <HTMLButtonElement>document.getElementById('newElectionBtn');
newElectionBtn.addEventListener('click', toggleNewElection);

let closeNewElection = <HTMLButtonElement>document.getElementById('closeNewElection');
closeNewElection.addEventListener('click', toggleNewElection);

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

let newElectionObject:newElectionInterface;
// Create an object storing new election data
createElectionBtn.addEventListener('click', () => {
    let newElectionObject = <any>{};
    let inputData:HTMLInputElement;
    for (let i=0; i<newElectionData.length; i++) {
        inputData = <HTMLInputElement>newElectionData[i];
        newElectionObject[inputData.name] = inputData.value;  
    }
    ipcRenderer.send('newElection',newElectionObject);
})