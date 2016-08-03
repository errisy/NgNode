# [AngularJS 2 Visual Studio 2015 Example](https://github.com/errisy/ng2ts)

AngularJS 2 beta has been published for quite a while. There is a [5 min quick start for TypeScript](https://angular.io/docs/ts/latest/quickstart.html). However, I could not find any example about how to get it work with Visual Studio 2015.

Therefore, in order to provide a starter example project to those who use Visual Studio 2015 to write Typescript for AngularJS 2, I made this example that get all TypeScript setting correct for AngularJs 2.

To download this project:
```bash
git clone  https://github.com/errisy/ng2ts  ng2ts
```

Then you just need to double click the 'ng2ts.vbproj' to open it with Visual Studio 2015. (You may need Visual Studio 2015 Update 2 or higher to support TypeScript 1.8).

Then it will work under either NodeJS lite or typical Apache-PHP setup.

To obtain all the files required for the original [AngularJS 2 exmaple](https://github.com/angular/quickstart/edit/master/README.md), you need to run

```bash
npm install
```
For details, check out the original quick start kit: [AngularJS 2 exmaple](https://github.com/angular/quickstart/edit/master/README.md)

## Notes for Beginners:
### Call a function of a child component?
  In Angular 2, you can get the reference of any Component in the 'template' by decorating a propary with @ViewChild('id in template').

  This is something you have to work around in Angular 1 by $scope.$broadcast or by obtaining the reference of a controller through   'two-way binding' of a directive.
### Call a function of a parent component from child component?
  Just use EventEmitter. However, you need to manually initialize the EventEmitter. Although I used to assume that Angular should do that for me automatically. But it doesn't.
```typescript
//[projectRoot]/app/event.example.ts
import {Component, Output, EventEmitter} from '@angular/core';
@Component({
  selector: '[test]',
  outputs: ['myEvent'];
})
export class EventExample{
  @Output('myEvent') public myEvent = new EventEmitter<string>(); //you must initialize it yourself.
}
```
When you use it:
```typescript
//[projectRoot]/app/app.component.ts
import {Component} from '@angular/core';
import {EventExample} from './event.example';
@Component({
  template: '<div test (myEvent)="handler($event)"></div>',
  directives: [EventExample]
})
export class AppComponent{
  handler($event){
    //your code here to handle the event.
  }
}
```
### rxjs Observable: map is not a function issue.
  That's a bug in TypeScript 1.8. If you met that particular problem, you can fix it by checking out [this](https://github.com/Microsoft/TypeScript/issues/7415). To be brief,replace the file "C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\CommonExtensions\Microsoft\TypeScript\typescriptServices.js" with the one found [here](https://raw.githubusercontent.com/Microsoft/TypeScript/Fix8518/lib/typescriptServices.js).
### Use jQuery.
  **Background:** Angular 2 has the (AMD)[https://github.com/amdjs/amdjs-api/wiki/AMD] loader system, which use 'require' to import modules. In a module, the code has to call the 'define' function to define a module. However, the official js file from jquery defines jQuery as 'jquery', and the (AMD)[https://github.com/amdjs/amdjs-api/wiki/AMD] loader can only load the jQuery function but not load it as a package with jQuery as a field/property. That caused some trouble with Visual Studio, because the TypeScript Compiler will compile "import * as jQuery from 'jquery'" to "var jquery_1 = require('jquery')". To use jquery with (AMD)[https://github.com/amdjs/amdjs-api/wiki/AMD] loader jquery.js must define jQuery as a property of the exported object so as to use "import {jQuery} from 'jquery'" syntax. and the jquery.js file can be simply placed there as well.
  
  Similarly, other js libraries can modified to fit Angular 2 as well by define proper export.
### TypeScript declaration file for modules.
  Where to put them? Since currently, Visual Studio's TypeScript Compiler will mainly search the "node_modules" folder, simply create a folder under "node_modules" and create the index.d.ts file there.
  To make that work for the browser, i.e. to tell systemjs where to load the module, the file "systemjs.config.js" must be configured by adding a definition in the 'map' object. such as: var map = {"ModuleName": "node_modules/ModuleName"}. Because the browser using systemjs won't be able to know how TypeScript compiler works for nodeJS. In the package object, you can also tell systemjs which one to load.
  
  Typescript declaration file: for "import {Type} from 'ModuleName'", there is no need for declaring a "module". Just export declare everything in the file.
```typescript
//[projectRoot]/node_modules/cat/cat.d.ts
interface Cat{
  meow():string;
}
declare var tom: Cat;
```
  When you use it:
```typescript
//[projectRoot]/app/anyfile.ts
import {tom, Cat} from 'cat';
tom.meow();
```
  Probably as a result of some bug, the typings folder didn't work very well for me at beginning. However, if you want to "import * as obj from 'ModuleName'", you can put a *.d.ts file in a subfolder of the typings folder. But it fails sometimes.
  To enable "import {} from 'modulename'", you 

