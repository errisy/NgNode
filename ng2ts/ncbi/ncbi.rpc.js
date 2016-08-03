"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Serializable_1 = require('Serializable');
var dog_1 = require('../app/dog');
var NCBIMethods = (function () {
    function NCBIMethods() {
    }
    NCBIMethods.prototype.test = function () {
        return 'let\'s encrypt!';
    };
    NCBIMethods.prototype.dogs = function () {
        var results = [];
        {
            var d = new dog_1.Dog();
            d.Name = 'labrador';
            results.push(d);
        }
        return results;
    };
    NCBIMethods.prototype.log = function (dog) {
        console.log(dog);
        this.search('science[journal] AND breast cancer AND 2008', 30);
    };
    NCBIMethods.prototype.search = function (keywords, limit) {
        var tasks = require('[tasks]');
        var obj = { keywords: keywords, limit: limit };
        var key = tasks.createTask('testnode\\task', [], obj);
        var time = Number(Date.now());
        var task = new Serializable_1.TaskInfo();
        task.id = key;
        task.starttime = time;
        return task;
    };
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', String)
    ], NCBIMethods.prototype, "test", null);
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Array)
    ], NCBIMethods.prototype, "dogs", null);
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [dog_1.Dog]), 
        __metadata('design:returntype', void 0)
    ], NCBIMethods.prototype, "log", null);
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String, Number]), 
        __metadata('design:returntype', Serializable_1.TaskInfo)
    ], NCBIMethods.prototype, "search", null);
    NCBIMethods = __decorate([
        Serializable_1.rpcService, 
        __metadata('design:paramtypes', [])
    ], NCBIMethods);
    return NCBIMethods;
}());
exports.NCBIMethods = NCBIMethods;
//# sourceMappingURL=ncbi.rpc.js.map