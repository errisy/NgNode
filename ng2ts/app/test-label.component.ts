import {Component, ElementRef, ViewChild, OnInit, AfterViewInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: '[test-label]',
    template: '<span>{{label}}</span>',
    inputs: ['label']
})
export class TestLabelComponent implements OnInit, AfterViewInit {
    elementRef: ElementRef;
    private _label: string;
    @Input('value') set label(value: string) {
        this._label = value;
    }
    get label(): string {
        return this._label;
    }
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }
    ngOnInit() {
        this._label = 'initialized';
    }
    ngAfterViewInit() {

    }
}
