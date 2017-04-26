'use strict';
var _a = require('electron'), remote = _a.remote, ipcRenderer = _a.ipcRenderer;
var dialog = remote.dialog;
var newElectionModal = document.getElementById('newElection');
// Show new election modal popup.
function toggleNewElection() {
    newElectionModal.classList.toggle('is-active');
}
var newElectionBtn = document.getElementById('newElectionBtn');
newElectionBtn.addEventListener('click', toggleNewElection);
var closeNewElection = document.getElementById('closeNewElection');
closeNewElection.addEventListener('click', toggleNewElection);
var imageBtn = document.getElementById('imageBtn');
var imageInput = document.getElementById('imageInput');
// Open file explorer window to select image.
imageBtn.addEventListener('click', function () {
    var imagePath = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
    });
    imageInput.value = (typeof imagePath != 'undefined') ? imagePath[0] : '';
});
var createElectionBtn = document.getElementById('createElectionBtn');
// All the inputfields in the create election popup modal.
var newElectionData = document.getElementsByClassName('newElectionData');
var newElectionObject;
// Create an object storing new election data
createElectionBtn.addEventListener('click', function () {
    var newElectionObject = {};
    var inputData;
    for (var i = 0; i < newElectionData.length; i++) {
        inputData = newElectionData[i];
        newElectionObject[inputData.name] = inputData.value;
    }
    ipcRenderer.send('newElection', newElectionObject);
});
//# sourceMappingURL=home.js.map