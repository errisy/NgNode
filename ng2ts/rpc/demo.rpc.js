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
var dog_1 = require("../app/dog");
var Serializable_1 = require('Serializable');
var Demo = (function () {
    function Demo() {
    }
    Demo.prototype.Dogs = function () {
        var list = [];
        {
            var c = 20;
            var d = new dog_1.Dog();
            d.Name = 'labrador';
            list.push(d);
        }
        {
            var d = new dog_1.Dog();
            d.Name = 'golden retriever';
            list.push(d);
            var c = '2243344';
        }
        return list;
    };
    Demo.prototype.test = function (jack, sam, jason) {
        return 'hello';
    };
    Demo.prototype.tom = function () {
        return new dog_1.Dog();
    };
    Demo.prototype.jerry = function () {
        return false;
    };
    Object.defineProperty(Demo.prototype, "Joke", {
        get: function () {
            return 'tester'; //no 
        },
        set: function (value) {
            console.log(value);
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Array)
    ], Demo.prototype, "Dogs", null);
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String, Number, dog_1.Dog]), 
        __metadata('design:returntype', String)
    ], Demo.prototype, "test", null);
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', dog_1.Dog)
    ], Demo.prototype, "tom", null);
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Boolean)
    ], Demo.prototype, "jerry", null);
    __decorate([
        Serializable_1.rpcMember, 
        __metadata('design:type', String)
    ], Demo.prototype, "Joke", null);
    Demo = __decorate([
        Serializable_1.rpcService, 
        __metadata('design:paramtypes', [])
    ], Demo);
    return Demo;
}());
exports.Demo = Demo;
// there shall be a function in vm that wraps this script and return new Demo() to serve the incoming request;
//return new Demo(); 
//# sourceMappingURL=demo.rpc.js.map