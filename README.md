# NgNode
An RPC and Serialization Implementation for Node-Angular2

## Features
1. One benefit of using typescript is that the same code can be used at both client and server, especially data types (classes). Ideally, a data object should be sent or recieved without losing the class definition. To Achieve that, a deserialization that can work both Node and Angular2 is implemented.
2. Instead of calling each individual REST api by URL string, management of relative APIs in a class could be simpler. Inspired by the idea of Remote Procedure Call, an RPC system was also implemented for typescript class. To make this easy to use, typescript compiler was modifed to automatically generate *.client.ts from *.rpc.ts. The *.client.ts files implement the RxJS and Angular 2 injectable, which can be easily consumed in any angular 2 componenet. All required js files in *.rpc.js will be loaded dynamically for each request to make the server side can be modified at runtime.
3. Dynamic execution of server side *.cgi.js file. All *.cgi.js file behave in a way similar to PHP file in the Apache-PHP environment. All required js files in *.cgi.js will be loaded dynamically for each request to make the server side can be modified at runtime.
4. Task running in forked child process. Since not all the query can be processed in a very short time. For complex task, a task host is supported by TaskHost in the server.

## Implementation
### NgNode/tsc2.js: this is Remote Procedure Call + typescript compiler. To use it, run the tsc.cmd to watch files changes. Remote Procedure Call files and javacript files will be automatically generated once changes are detected.
### NgNode/ng2ts/server.sys.ts, NgNode/ng2ts/mime.sys.ts: those are the NodeJS http server scripts. They are responsible for all server side features, such as dynamically invoking of *.rpc.js and *.cgi.js files, dynamically resolution of required js files and deserialization of objects. NgNode/ng2ts/watch.ts is the script that detects changes in server.sys.ts. To run the server, just run watch.cmd. The server will be automatically restarted when changes are detected. You can integrate those features into Express. However, here I prefer to make it a standalone server script.
#### By default, the server script will reject all request for *.sys.js, *.rpc.js and *.cgi.js files, because those files are strict server side scripts and are kept away from client side for security concerns.
### NgNode/ng2ts/node_modules/Serializable: this is a module that implemented deserialization for both Angular 2 client side and NodeJS server side. It also provides @Serializable, @rpcService and @rpcMember decorators, and TaskInfo class for updating task information.


## Examples
### Serializable Class
By applying @Serializable('/app/dog') decorator, a class can be deserialized at both client and server automatically when it is passed through Remote Procedure Call system.
``` typescript
import {Serializable} from 'Serializable';
@Serializable('/app/dog')
export class Dog {
    public Name: string;
    public Test: string = "test property";
}
```
### Remote Procedure Call
In the following example, TaskInfo from 'Serializable' is a Serializable class in a NodeJs module. However, this 'Serializable' module can work at both client and server side. Dog from '../app/dog' is a class defined in /app/dog.js. Both of those serializable classes can be deserialized by client and server.
@rpcService decorator indicates that a class is a Remote Procedure Call service. @rpcMember decorator indicates that a member function is a Remote Procedure Call method.


``` typescript
import {rpcService, rpcMember, ITaskHost, TaskInfo} from 'Serializable';
import {Dog} from '../app/dog';

interface ISearchTask {
    keywords: string;
    limit: number;
}

@rpcService
export class NCBIMethods {
    @rpcMember
    public test():string {
        return 'let\'s encrypt!';
    }
    @rpcMember
    public dogs(): Dog[] {
        let results: Dog[] = [];
        {
            let d = new Dog();
            d.Name = 'labrador';
            results.push(d);
        }
        return results;
    }
    @rpcMember
    public log(dog: Dog) {
        console.log(dog);
        this.search('science[journal] AND breast cancer AND 2008', 30);
    }
    @rpcMember
    public search(keywords: string, limit: number): TaskInfo {
        let tasks: ITaskHost = require('[tasks]');
        let obj: ISearchTask = { keywords: keywords, limit: limit };
        let key = tasks.createTask('testnode\\task', [], obj);
        let time = Number(Date.now());
        let task = new TaskInfo();
        task.id = key;
        task.starttime = time;
        return task;
    }
}
```
ncbi.client.ts, which is generated by the modified typescript compiler automatically.
In an Angular 2 component file, it can be consumed by import {NCBIMethods} from '../ncbi/ncbi.client';
Since Angular 2 is using the AMD loader system, there is no conflict when client class has the same name as the service class.
``` typescript
//Client file generated by RPC Compiler.
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Deserialize, Converter } from 'Serializable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {rpcService, rpcMember, ITaskHost, TaskInfo} from 'Serializable';

import {Dog} from '../app/dog';
@Injectable()
export class NCBIMethods {
	constructor(private $_Angular2HttpClient: Http){
	}
	public test(): Observable<string>{
		return this.$_Angular2HttpClient.post('/ncbi/ncbi.rpc.js?NCBIMethods-test', []).map(Converter.convertStringResponse);
	}
	public dogs(): Observable< Dog[]>{
		return Observable.create((observer: Observer< Dog[]>) => {
			this.$_Angular2HttpClient.post('/ncbi/ncbi.rpc.js?NCBIMethods-dogs', []).map(Converter.convertStringResponse).subscribe(stringValue => {
				console.log("stringValue: ", stringValue);
				if(stringValue){
					let jsonObject = JSON.parse(stringValue);
					Deserialize(jsonObject, (deserialized) => {
						observer.next(deserialized);
						observer.complete();
					});
				}
				else{
					observer.next(null);
					observer.complete();
				}
			});
		});
	}
	public log(dog:  Dog): Observable<any>{
		return Observable.create((observer: Observer<any>) => {
			this.$_Angular2HttpClient.post('/ncbi/ncbi.rpc.js?NCBIMethods-log', [dog]).map(Converter.convertStringResponse).subscribe(stringValue => {
				console.log("stringValue: ", stringValue);
				if(stringValue){
					let jsonObject = JSON.parse(stringValue);
					Deserialize(jsonObject, (deserialized) => {
						observer.next(deserialized);
						observer.complete();
					});
				}
				else{
					observer.next(null);
					observer.complete();
				}
			});
		});
	}
	public search(keywords:  string, limit:  number): Observable< TaskInfo>{
		return Observable.create((observer: Observer< TaskInfo>) => {
			this.$_Angular2HttpClient.post('/ncbi/ncbi.rpc.js?NCBIMethods-search', [keywords, limit]).map(Converter.convertStringResponse).subscribe(stringValue => {
				console.log("stringValue: ", stringValue);
				if(stringValue){
					let jsonObject = JSON.parse(stringValue);
					Deserialize(jsonObject, (deserialized) => {
						observer.next(deserialized);
						observer.complete();
					});
				}
				else{
					observer.next(null);
					observer.complete();
				}
			});
		});
	}
}
```
