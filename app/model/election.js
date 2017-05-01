'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fileManager = require("./fileManager");
var Election = (function () {
    function Election(name, desciption, image, fontColor) {
        this.name = name;
        this.desciption = desciption;
        this.image = image;
        this.fontColor = fontColor;
        this.offices = [];
    }
    Election.prototype.addOffice = function (office) {
        this.offices.push(office);
    };
    Election.prototype.removeOffice = function (office) {
        var index = this.offices.indexOf(office);
        this.offices.splice(index, 1);
    };
    return Election;
}());
var Office = (function () {
    function Office(name, desciption, image, fontColor) {
        this.name = name;
        this.desciption = desciption;
        this.image = image;
        this.fontColor = fontColor;
        this.candidates = [];
    }
    Office.prototype.addCandidate = function (candidate) {
        this.candidates.push(candidate);
    };
    Office.prototype.removeCandidate = function (candidate) {
        var index = this.candidates.indexOf(candidate);
        this.candidates.splice(index, 1);
    };
    return Office;
}());
var Candidate = (function () {
    function Candidate(name, image) {
        this.name = name;
        this.votes = 0;
    }
    Candidate.prototype.vote = function () {
        this.votes++;
    };
    return Candidate;
}());
function initNewElection(data, appData, appDataFile, password) {
    var _a = fileManager.newElectionData(), dataFile = _a.dataFile, imageDir = _a.imageDir, randomDir = _a.randomDir;
    data['dataDirectory'] = randomDir;
    data['dataFile'] = dataFile;
    data['imageData'] = imageDir;
    data['offices'] = [];
    fileManager.writeJSONData(path.join(randomDir, dataFile), data, password);
    appData.elections.push({ name: data.name, dataDirectory: randomDir, dataFile: dataFile });
    fileManager.writeJSONData(appDataFile, appData, password);
    return data;
}
exports.initNewElection = initNewElection;
//# sourceMappingURL=election.js.map