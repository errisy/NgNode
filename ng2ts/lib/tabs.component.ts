import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';

@Component(
    {
        selector: 'tabs',
        template: '<ul class="nav nav-tabs">\
\t<li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">\
\t\t<a [style.cursor]="\'pointer\'">{{tab.tabTitle}}</a>\
\t</li>\
</ul>\
<ng-content></ng-content>'
    }
)
export class TabsComponent {
    public tabs: TabComponent[] = [];
    public addTab(tab: TabComponent) {
        if (this.tabs.length == 0) tab.active = true;
        this.tabs.push(tab);
        //console.log('add tab: ', tab.tabTitle);
    }
    public selectTab(tab: TabComponent) {
        this.tabs.forEach(item => item.active = false);
        tab.active = true;
    }
    public OnTabInitialized($event: TabComponent) {
        this.addTab($event);
    }
}

@Component(
    {
        selector: 'tab',
        template: '<div [hidden]="!active">\
\t<ng-content></ng-content>\
</div>'
    }
)
export class TabComponent implements OnInit {
    @Input()
    public tabTitle: string;
    public active: boolean;
    @Output() public OnTabInitialized: EventEmitter<TabComponent> = new EventEmitter();
    ngOnInit() {
        //this.OnTabInitialized.emit(this);
    }
    // a parent scope can be used as injectable
    constructor(tabs: TabsComponent) {
        tabs.addTab(this);
    }
}