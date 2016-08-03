import {Component, ElementRef, ViewChild, ContentChild, QueryList, ContentChildren, OnInit, TemplateRef, AfterViewInit, EventEmitter, NgZone, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AceComponent} from './ace.component';
import {TestLabelComponent} from './test-label.component';
import {CodeService} from './code.service';

@Component({ //\\<div ace [code] = "editorCode" style= "width:50%;height:300px;" > </div>
    selector: 'my-app',
    template: '<h1>Protein Web Query Gateway</h1>\
<div ace #editor [code]="editorCode" (initialized)="editorInitialized($event)" style= "width:50%;height:300px;" ></div>\
<button (click)="buttonClicked()">set code</button>\
<div test-label [value]="editorCode"></div>',
    directives: [AceComponent, TestLabelComponent],
    providers: [CodeService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit {
    elementRef: ElementRef; 
    private codeService: CodeService;
    private $ChangeDetectorRef: ChangeDetectorRef;
    private detect: () => void;
    @ViewChild('editor') private editor: AceComponent;
    @ContentChildren(AceComponent) private children: QueryList<AceComponent>;
    constructor(elementRef: ElementRef, private code: CodeService, private ngZone: NgZone, private cRef: ChangeDetectorRef) {
        console.log('this constructor:', this);
        this.elementRef = elementRef;
        this.codeService = code;
        this.detect = () => {
            cRef.detectChanges();
        };
    }
    private count: number = 0;
    editorInitialized(eventArgs: any) {
        console.log('editorInitialized', eventArgs);
        this.buttonClicked();
    }
    buttonClicked() {
        console.log('clicked');
        //this.editorCode = 'hello javascript!' + this.count;
        //this.count++;
        let that = this;
        console.log('children:', this.children.length);
        this.codeService.Code.subscribe((code: string) => {
            console.log('editor', that.editor);
            that.editor.code = code;
            //that.cRef.detectChanges();
        });
    }
 
    private editorCode: string;
    ngOnInit() {
        
    }
    ngAfterViewInit() {
        //this.buttonClicked();
    }
}
