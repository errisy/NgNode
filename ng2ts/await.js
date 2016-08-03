"use strict";
var http = require('http');
console.log('start');
function httpRequest(options) {
    return function (callback) {
        var client = http.request(options, function (res) {
            var chunk = '';
            res.on('data', function (value) {
                chunk += value;
            });
            res.on('end', function (value) {
                chunk += value;
                callback(chunk);
            });
        });
        client.end();
    };
}
var async = (function () {
    function async() {
        this.statements = [];
        this.canRun = true;
    }
    async.prototype.run = function (statement) {
        var _this = this;
        this.statements.push(function () {
            statement();
            _this.next();
        });
        if (this.canRun)
            this.next();
    };
    async.prototype.await = function (statement, setter) {
        var _this = this;
        this.statements.push(function () {
            statement(function (value) {
                setter(value);
                _this.next();
            });
        });
        if (this.canRun)
            this.next();
    };
    async.prototype.next = function () {
        if (this.statements.length > 0) {
            var ia = this.statements.shift();
            this.canRun = false;
            ia();
        }
        else {
            this.canRun = true;
        }
    };
    return async;
}());
function test() {
    var a = new async();
    var html;
    a.run(function () { return console.log('first step'); });
    a.await(httpRequest({ host: 'm.newsmth.net' }), function (value) { return html = value; });
    a.run(function () { return console.log('res: ', html.substr(0, 40)); });
    a.await(httpRequest({ host: 'localhost' }), function (value) { return html = value; });
    a.run(function () { return console.log('res: ', html.substr(0, 80)); });
    a.run(function () {
        console.log('res method: ');
    });
}
console.log('before test');
test();
//# sourceMappingURL=await.js.map