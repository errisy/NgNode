"use strict";
var fs = require('fs');
//this is the one that works for cgi file pattern so as to avoid vm;
var CGI = require('./demo.rpc');
var Util = require('./util');
var request = require('[request]');
var response = require('[response]');
var next = require('[next]');
var prepareParameters = function () {
    console.log(request.url);
    var Path = Util.UrlParse(request);
    if (Path.Class) {
        if (Path.Member) {
            response.writeHead(200, {
                "Content-Type": "text/plain"
            });
            var $_ServiceObject_1 = new CGI[Path.Class]();
            Util.Receive(request, function ($parameters) {
                var k = new CGI.Demo();
                var member = $_ServiceObject_1[Path.Member];
                var result = member.apply($_ServiceObject_1, $parameters);
                response.end(JSON.stringify(result));
            });
        }
        else {
            die('invalid method name');
        }
    }
    else {
        die('invalid class name');
    }
};
var die = function (msg) {
    response.writeHead(500, {
        "Content-Type": "text/plain"
    });
    response.end(msg);
};
var stat = function (err, stats) {
    if (err) {
        die(err.message);
    }
    else {
        if (stats.isFile()) {
            prepareParameters();
        }
        else {
            die('is not a file');
        }
    }
};
var fileExists = function (exists) {
    if (exists) {
        fs.stat('demo.rpc.js', stat);
    }
    else {
        die('file does not exist;');
    }
};
fs.exists('demo.rpc.js', fileExists);
//# sourceMappingURL=demo.cgi.js.map