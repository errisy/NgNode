import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import { Deserialize } from 'Serializable';
import 'rxjs/observable/bindCallback';
import 'rxjs/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
//Client side code for Angualr2
//thanks for this video about how to use rxjs observable 
//https://egghead.io/lessons/rxjs-creating-an-observable

@Injectable()
export class CodeService {
    constructor(private http: Http) {
        console.log('Http service:', http);
    }
    get Code(): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            this.http.post('../rpc/demoservice.ts', "").map(this.convertResponse)
                .subscribe(value => {
                    this.callback(value, data => {
                        observer.next(data);
                        observer.complete();
                    } );
                });
        });
    }

    //get Method(): Observable<Dog> {
    //    return Observable.create((observer: Observer<Dog>) => {
    //        this.http.post('../rpc/demoservice.ts', "").map(this.jsonResponse)
    //            .subscribe(value => {
    //                Deserialize(value, (deserialized) => {
    //                    observer.next(deserialized);
    //                    observer.complete();
    //                });
    //            });
    //    });
    //}
    private callback(input: string, callback: (value: string) => void) {
        setTimeout(() => {
            callback(input + '\n callback invoked!');
        }, 500);
    }

    convertResponse(res: Response): string {
        return res.text();
    }
    jsonResponse(res: Response): Object {
        return res.json();
    }
    private listUrl = 'api/dog.js';
}