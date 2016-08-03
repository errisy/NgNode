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
var TabsComponent = (function () {
    function TabsComponent() {
        this.tabs = [];
    }
    TabsComponent.prototype.addTab = function (tab) {
        if (this.tabs.length == 0)
            tab.active = true;
        this.tabs.push(tab);
        //console.log('add tab: ', tab.tabTitle);
    };
    TabsComponent.prototype.selectTab = function (tab) {
        this.tabs.forEach(function (item) { return item.active = false; });
        tab.active = true;
    };
    TabsComponent.prototype.OnTabInitialized = function ($event) {
        this.addTab($event);
    };
    TabsComponent = __decorate([
        core_1.Component({
            selector: 'tabs',
            template: '<ul class="nav nav-tabs">\
\t<li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">\
\t\t<a [style.cursor]="\'pointer\'">{{tab.tabTitle}}</a>\
\t</li>\
</ul>\
<ng-content></ng-content>'
        }), 
        __metadata('design:paramtypes', [])
    ], TabsComponent);
    return TabsComponent;
}());
exports.TabsComponent = TabsComponent;
var TabComponent = (function () {
    // a parent scope can be used as injectable
    function TabComponent(tabs) {
        this.OnTabInitialized = new core_1.EventEmitter();
        tabs.addTab(this);
    }
    TabComponent.prototype.ngOnInit = function () {
        //this.OnTabInitialized.emit(this);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], TabComponent.prototype, "tabTitle", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], TabComponent.prototype, "OnTabInitialized", void 0);
    TabComponent = __decorate([
        core_1.Component({
            selector: 'tab',
            template: '<div [hidden]="!active">\
\t<ng-content></ng-content>\
</div>'
        }), 
        __metadata('design:paramtypes', [TabsComponent])
    ], TabComponent);
    return TabComponent;
}());
exports.TabComponent = TabComponent;
//# sourceMappingURL=tabs.component.js.map