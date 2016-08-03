import * as fs from "fs";
import * as http from "http";

import * as vm from "vm";
import * as path from 'path';


console.log(__dirname, __filename);


import {Dog} from "../app/dog";

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
res.end(path.parse('"../app//dog.js"'));



