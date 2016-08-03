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
var TestLabelComponent = (function () {
    function TestLabelComponent(elementRef) {
        this.elementRef = elementRef;
    }
    Object.defineProperty(TestLabelComponent.prototype, "label", {
        get: function () {
            return this._label;
        },
        set: function (value) {
            this._label = value;
        },
        enumerable: true,
        configurable: true
    });
    TestLabelComponent.prototype.ngOnInit = function () {
        this._label = 'initialized';
    };
    TestLabelComponent.prototype.ngAfterViewInit = function () {
    };
    __decorate([
        core_1.Input('value'), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], TestLabelComponent.prototype, "label", null);
    TestLabelComponent = __decorate([
        core_1.Component({
            selector: '[test-label]',
            template: '<span>{{label}}</span>',
            inputs: ['label']
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], TestLabelComponent);
    return TestLabelComponent;
}());
exports.TestLabelComponent = TestLabelComponent;
//# sourceMappingURL=test-label.component.js.map