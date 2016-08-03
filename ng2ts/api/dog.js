"use strict";
var fs = require("fs");
var dog_1 = require("ng2ts/dog");
var vm = require("vm");
console.log(__dirname, __filename);
var d2 = new dog_1.Dog();
var code = '(function (){\ntry{\n\texports = {};\n' +
    fs.readFileSync('app/dog.js').toString() +
    '\n\treturn exports;\n}\ncatch(ex){\n\tconsole.log("Error:", ex);\n}\n})';
var def = require('./app/dog');
console.log('imported def', def);
console.log('code: ', code);
var context = vm.createContext({
    console: console,
    require: require,
    __dirname: __dirname,
    __filename: __filename,
    process: process
});
var _script = vm.createScript(code);
var fn = _script.runInContext(context);
var exported = fn();
console.log(exported);
var testDog = new exported.Dog();
testDog.Name = "tester";
console.log(testDog);
//import {Dog} from "../app/dog";
var req = require('[request]');
var res = require('[response]');
var next = require('[next]');
var _path = './api' + req.url;
res.writeHead(200, {
    "Content-Type": "application/json"
});
var dogs = [];
{
    var d1 = new dog_1.Dog();
    d1.Name = 'labrador';
    dogs.push(d1);
    var d2_1 = new dog_1.Dog();
    d2_1.Name = 'golden retriever';
    dogs.push(d2_1);
}
res.end(JSON.stringify(dogs));
//# sourceMappingURL=dog.js.map