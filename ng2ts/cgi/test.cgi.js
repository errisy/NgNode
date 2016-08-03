"use strict";
var fs = require('fs');
var cat_1 = require('./cat');
var insider;
(function (insider) {
    var res = require('[response]');
    var c = new cat_1.Cat();
    c.name = 'tom';
    var value = fs.readFileSync(__dirname + '/cat.ts').toString();
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end(JSON.stringify(c) + '\n' + value);
})(insider || (insider = {}));
//# sourceMappingURL=test.cgi.js.map