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
var ace_component_1 = require('./ace.component');
var test_label_component_1 = require('./test-label.component');
var code_service_1 = require('./code.service');
var AppComponent = (function () {
    function AppComponent(elementRef, code, ngZone, cRef) {
        this.code = code;
        this.ngZone = ngZone;
        this.cRef = cRef;
        this.count = 0;
        console.log('this constructor:', this);
        this.elementRef = elementRef;
        this.codeService = code;
        this.detect = function () {
            cRef.detectChanges();
        };
    }
    AppComponent.prototype.editorInitialized = function (eventArgs) {
        console.log('editorInitialized', eventArgs);
        this.buttonClicked();
    };
    AppComponent.prototype.buttonClicked = function () {
        console.log('clicked');
        //this.editorCode = 'hello javascript!' + this.count;
        //this.count++;
        var that = this;
        console.log('children:', this.children.length);
        this.codeService.Code.subscribe(function (code) {
            console.log('editor', that.editor);
            that.editor.code = code;
            //that.cRef.detectChanges();
        });
    };
    AppComponent.prototype.ngOnInit = function () {
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        //this.buttonClicked();
    };
    __decorate([
        core_1.ViewChild('editor'), 
        __metadata('design:type', ace_component_1.AceComponent)
    ], AppComponent.prototype, "editor", void 0);
    __decorate([
        core_1.ContentChildren(ace_component_1.AceComponent), 
        __metadata('design:type', core_1.QueryList)
    ], AppComponent.prototype, "children", void 0);
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            template: '<h1>Protein Web Query Gateway</h1>\
<div ace #editor [code]="editorCode" (initialized)="editorInitialized($event)" style= "width:50%;height:300px;" ></div>\
<button (click)="buttonClicked()">set code</button>\
<div test-label [value]="editorCode"></div>',
            directives: [ace_component_1.AceComponent, test_label_component_1.TestLabelComponent],
            providers: [code_service_1.CodeService],
            changeDetection: core_1.ChangeDetectionStrategy.OnPush
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, code_service_1.CodeService, core_1.NgZone, core_1.ChangeDetectorRef])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map