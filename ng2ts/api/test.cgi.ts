import * as http from "http";
import * as fs from "fs";
import * as path from 'path';
import {Dog} from "../app/dog";  
import * as ser from '../rpc/serialization';


console.log('test.cgi.js is running...');

let req: http.ServerRequest = require('[request]');
let res: http.ServerResponse = require('[response]');
let next: Function = require('[next]'); 

var d2: Dog = new Dog();

var _path = './api' + req.url;
res.writeHead(200, {
    "Content-Type": "text/plain"
});

let d3 = JSON.parse(JSON.stringify(d2));

console.log('JSON: ', d3);
console.log('Root Path: ', require.main.filename);
let d4: Dog = ser.Deserialize(d3);
console.log(JSON.stringify(d4));

res.end('Dog: ' + JSON.stringify(d4));