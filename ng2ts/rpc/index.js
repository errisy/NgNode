//this file determines whether it is running at client or server.
"use strict";
if (!exports)
    exports = {};
var _module = exports;
if (window) {
    //code for client;
    var rpcModule = require('client.js');
    _module.RPC = rpcModule.RPC;
    _module.RPCGateway = rpcModule.RPCGateway;
}
if (process) {
    //code for nodejs;
    var rpcModule = require('server.js');
    _module.RPC = rpcModule.RPC;
    _module.RPCGateway = rpcModule.RPCGateway;
}
//# sourceMappingURL=index.js.map