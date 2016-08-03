"use strict";
var path = require('path');
console.log(__dirname, __filename);
var dog_1 = require("../app/dog");
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
    var d2 = new dog_1.Dog();
    d2.Name = 'golden retriever';
    dogs.push(d2);
}
res.end(path.parse('"../app//dog.js"'));
//# sourceMappingURL=dog.cgi.js.map