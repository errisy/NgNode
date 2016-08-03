import {Component, ElementRef, ViewChild, OnInit, AfterViewInit, Input, Output, EventEmitter} from '@angular/core';
import {ace, AceEditor} from "ace";
import {jQuery, JQuery} from "jquery";


@Component({
    selector: '[ace]', 
    template: '',
    outputs: ['initialized'],
    inputs: ['code']
})
export class AceComponent implements OnInit, AfterViewInit {
    elementRef: ElementRef;
    private ace: AceEditor;
    @Output('initialized') private initialized: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input('code') public set code(value: string) {
        console.log('setting code:', value);
        if (this.ace) if (this.ace.setValue) {
            this.ace.setValue(value);
        }
        console.log('this.initialized', this.initialized);
    }
    public get code(): string {
        return this.ace.getValue();
    }
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
        var $el: JQuery = jQuery(this.elementRef);
        console.log('ace editor constructor');
    }
    buttonClicked() { 
        
    }

    ngOnInit() {
        console.log('ace editor ngOnInit');
        var host: HTMLElement = this.elementRef.nativeElement;
        this.ace = ace.edit(host);
        this.ace.setTheme('ace/theme/monokai');
        this.ace.getSession().setMode('ace/mode/javascript');
        this.ace.$blockScrolling = Infinity;
 
        console.log('this.initialized', this.initialized);
        if (this.initialized)  this.initialized.emit(true);
    }
    ngAfterViewInit() {
        
    }
}
