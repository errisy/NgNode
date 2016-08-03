"use strict";
var dog_tom_1 = require("../app/dog.tom");
var req = require('[request]');
var res = require('[response]');
var next = require('[next]');
var d2 = new dog_tom_1.Dog();
var _path = './api' + req.url;
res.writeHead(200, {
    "Content-Type": "text/plain"
});
res.end(JSON.stringify(d2));
//# sourceMappingURL=test.js.map