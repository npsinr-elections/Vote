'use strict';
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
//# sourceMappingURL=election.js.map