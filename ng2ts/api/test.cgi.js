"use strict";
var dog_1 = require("../app/dog");
var ser = require('../rpc/serialization');
console.log('test.cgi.js is running...');
var req = require('[request]');
var res = require('[response]');
var next = require('[next]');
var d2 = new dog_1.Dog();
var _path = './api' + req.url;
res.writeHead(200, {
    "Content-Type": "text/plain"
});
var d3 = JSON.parse(JSON.stringify(d2));
console.log('JSON: ', d3);
console.log('Root Path: ', require.main.filename);
var d4 = ser.Deserialize(d3);
console.log(JSON.stringify(d4));
res.end('Dog: ' + JSON.stringify(d4));
//# sourceMappingURL=test.cgi.js.map