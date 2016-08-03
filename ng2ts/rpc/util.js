"use strict";
function Receive(request, callback) {
    var body = "";
    request.on('data', function (chunk) {
        body += chunk;
    });
    request.on('end', function () {
        if (callback)
            callback(JSON.parse(body));
    });
}
exports.Receive = Receive;
function UrlParse(request) {
    var matches = /\?(\w+)#(\w+)$/.exec(request.url);
    return {
        Class: matches[1], Member: matches[2]
    };
}
exports.UrlParse = UrlParse;
//# sourceMappingURL=util.js.map