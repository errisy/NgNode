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
var ncbi_client_1 = require('./ncbi.client');
var dog_1 = require('../app/dog');
var tabs_component_1 = require('../lib/tabs.component');
var NCBIComponent = (function () {
    function NCBIComponent(rpc) {
        this.rpc = rpc;
        this.localkeyword = 'local keywords';
        this.ncbikeywords = 'stability proline';
        this.tasks = [];
    }
    NCBIComponent.prototype.test = function () {
        var d = new dog_1.Dog();
        d.Name = 'labrador';
        d.Test = 'agree';
        this.rpc.log(d).subscribe();
    };
    NCBIComponent.prototype.search = function () {
        var _this = this;
        //check keywords;
        if (!this.ncbikeywords)
            return; //it shall not be null;
        if (this.ncbikeywords.length == 0)
            return; //it shall not be empty
        if (this.ncbikeywords.replace(/\s+/ig, '').length == 0)
            return; // it shall not be only spaces
        //this will send a requst to the server and start the search task for ncbi;
        console.log('send search command.');
        this.rpc.search(this.ncbikeywords, 1000).subscribe(function (task) {
            _this.tasks.push(task);
        });
    };
    NCBIComponent = __decorate([
        core_1.Component({
            selector: 'ncbi-client',
            templateUrl: 'ncbi/search.html',
            providers: [ncbi_client_1.NCBIMethods],
            directives: [tabs_component_1.TabsComponent, tabs_component_1.TabComponent]
        }), 
        __metadata('design:paramtypes', [ncbi_client_1.NCBIMethods])
    ], NCBIComponent);
    return NCBIComponent;
}());
exports.NCBIComponent = NCBIComponent;
//# sourceMappingURL=ncbi.component.js.map