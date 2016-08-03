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
var ace_1 = require("ace");
var jquery_1 = require("jquery");
var AceComponent = (function () {
    function AceComponent(elementRef) {
        this.initialized = new core_1.EventEmitter();
        this.elementRef = elementRef;
        var $el = jquery_1.jQuery(this.elementRef);
        console.log('ace editor constructor');
    }
    Object.defineProperty(AceComponent.prototype, "code", {
        get: function () {
            return this.ace.getValue();
        },
        set: function (value) {
            console.log('setting code:', value);
            if (this.ace)
                if (this.ace.setValue) {
                    this.ace.setValue(value);
                }
            console.log('this.initialized', this.initialized);
        },
        enumerable: true,
        configurable: true
    });
    AceComponent.prototype.buttonClicked = function () {
    };
    AceComponent.prototype.ngOnInit = function () {
        console.log('ace editor ngOnInit');
        var host = this.elementRef.nativeElement;
        this.ace = ace_1.ace.edit(host);
        this.ace.setTheme('ace/theme/monokai');
        this.ace.getSession().setMode('ace/mode/javascript');
        this.ace.$blockScrolling = Infinity;
        console.log('this.initialized', this.initialized);
        if (this.initialized)
            this.initialized.emit(true);
    };
    AceComponent.prototype.ngAfterViewInit = function () {
    };
    __decorate([
        core_1.Output('initialized'), 
        __metadata('design:type', core_1.EventEmitter)
    ], AceComponent.prototype, "initialized", void 0);
    __decorate([
        core_1.Input('code'), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], AceComponent.prototype, "code", null);
    AceComponent = __decorate([
        core_1.Component({
            selector: '[ace]',
            template: '',
            outputs: ['initialized'],
            inputs: ['code']
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], AceComponent);
    return AceComponent;
}());
exports.AceComponent = AceComponent;
//# sourceMappingURL=ace.component.js.map