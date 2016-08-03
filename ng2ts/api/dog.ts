import * as fs from "fs";
import * as http from "http";
import {Dog} from "ng2ts/dog";
import * as vm from "vm";

console.log(__dirname, __filename);

var d2: Dog = new Dog();

let code = '(function (){\ntry{\n\texports = {};\n' +
    fs.readFileSync('app/dog.js').toString() +
    '\n\treturn exports;\n}\ncatch(ex){\n\tconsole.log("Error:", ex);\n}\n})';
let def = require('./app/dog');
console.log('imported def', def);
console.log('code: ', code);
let context = vm.createContext({
    console: console,
    require: require,
    __dirname: __dirname,
    __filename: __filename,
    process: process
}); 
let _script = vm.createScript(code);
let fn: Function = _script.runInContext(context);
let exported: any = fn();

console.log(exported);
var testDog: any = new exported.Dog();
testDog.Name = "tester";
console.log(testDog);


//import {Dog} from "../app/dog";

let req: http.ServerRequest = require('[request]');
let res: http.ServerResponse = require('[response]');
let next: Function = require('[next]');

let _path = './api' + req.url;

res.writeHead(200, {
    "Content-Type": "application/json"
});
let dogs: Dog[] = [];
{
    let d1 = new Dog();
    d1.Name = 'labrador';
    dogs.push(d1);
    let d2 = new Dog();
    d2.Name = 'golden retriever';
    dogs.push(d2)
}
res.end(JSON.stringify(dogs));



