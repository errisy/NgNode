import {Component} from '@angular/core';
import {NCBIMethods} from './ncbi.client';
import {Deserialize, TaskInfo} from 'Serializable';
import {Dog} from '../app/dog';
import {TabsComponent, TabComponent} from '../lib/tabs.component';

@Component(
    {
        selector: 'ncbi-client',
        templateUrl: 'ncbi/search.html',
        providers: [NCBIMethods],
        directives: [TabsComponent, TabComponent]
    }
)
export class NCBIComponent {
    constructor(private rpc: NCBIMethods) {
        
    }
    public test() {
        let d = new Dog();
        d.Name = 'labrador';
        d.Test = 'agree';
        this.rpc.log(d).subscribe();
    }
    public search() {
        //check keywords;
        if (!this.ncbikeywords) return; //it shall not be null;
        if (this.ncbikeywords.length == 0) return; //it shall not be empty
        if (this.ncbikeywords.replace(/\s+/ig, '').length == 0) return; // it shall not be only spaces
        //this will send a requst to the server and start the search task for ncbi;
        console.log('send search command.');
        this.rpc.search(this.ncbikeywords, 1000).subscribe(task => {
            this.tasks.push(task);
        });
    }
    public localkeyword: string = 'local keywords';
    public ncbikeywords: string = 'stability proline';
    public tasks: TaskInfo[] = [];
}