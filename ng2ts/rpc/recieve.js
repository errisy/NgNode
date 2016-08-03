"use strict";
function receive(request, callback) {
    let body = "";
    request.on('data', function (chunk) {
        body += chunk;
    });
    request.on('end', function () {
        if (callback)
            callback(body);
    });
}
exports.receive = receive;
