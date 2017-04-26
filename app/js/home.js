'use strict';
var require;
var newElectionObject = {};
var dialog = require('electron').remote.dialog;
var newElectionBtn = document.getElementById('newElectionBtn');
newElectionBtn.addEventListener('click', toggleNewElection);
var closeNewElection = document.getElementById('closeNewElection');
closeNewElection.addEventListener('click', toggleNewElection);
var imageBtn = document.getElementById('imageBtn');
var imageInput = document.getElementById('imageInput');
var createElectionBtn = document.getElementById('createElectionBtn');
imageBtn.addEventListener('click', function () {
    var imagePath = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
    });
    imageInput.value = (typeof imagePath != 'undefined') ? imagePath : '';
});
createElectionBtn.addEventListener('click', function () {
    var newElectionData = document.getElementsByClassName('newElectionData');
    console.log(newElectionData);
    var inputData;
    for (var i = 0; i < newElectionData.length; i++) {
        inputData = newElectionData[i];
        console.log(inputData);
        newElectionObject[inputData.name] = inputData.value;
    }
    console.log(newElectionObject);
});
function toggleNewElection() {
    var newElectionModal = document.getElementById('newElection');
    newElectionModal.classList.toggle('is-active');
}
//# sourceMappingURL=home.js.map