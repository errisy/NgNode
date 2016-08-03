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
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var Observable_1 = require('rxjs/Observable');
require('rxjs/observable/bindCallback');
require('rxjs/observable/from');
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
//Client side code for Angualr2
//thanks for this video about how to use rxjs observable 
//https://egghead.io/lessons/rxjs-creating-an-observable
var CodeService = (function () {
    function CodeService(http) {
        this.http = http;
        this.listUrl = 'api/dog.js';
        console.log('Http service:', http);
    }
    Object.defineProperty(CodeService.prototype, "Code", {
        get: function () {
            var _this = this;
            return Observable_1.Observable.create(function (observer) {
                _this.http.post('../rpc/demoservice.ts', "").map(_this.convertResponse)
                    .subscribe(function (value) {
                    _this.callback(value, function (data) {
                        observer.next(data);
                        observer.complete();
                    });
                });
            });
        },
        enumerable: true,
        configurable: true
    });
    //get Method(): Observable<Dog> {
    //    return Observable.create((observer: Observer<Dog>) => {
    //        this.http.post('../rpc/demoservice.ts', "").map(this.jsonResponse)
    //            .subscribe(value => {
    //                Deserialize(value, (deserialized) => {
    //                    observer.next(deserialized);
    //                    observer.complete();
    //                });
    //            });
    //    });
    //}
    CodeService.prototype.callback = function (input, callback) {
        setTimeout(function () {
            callback(input + '\n callback invoked!');
        }, 500);
    };
    CodeService.prototype.convertResponse = function (res) {
        return res.text();
    };
    CodeService.prototype.jsonResponse = function (res) {
        return res.json();
    };
    CodeService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], CodeService);
    return CodeService;
}());
exports.CodeService = CodeService;
//# sourceMappingURL=code.service.js.map