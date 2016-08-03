//this file determines whether it is running at client or server.

export var RPC: (url?: string, method?: 'POST' | 'GET') => (target: Object, properyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export var RPCGateway: (url: string, method?: 'POST' | 'GET') => (target: any) => any;



interface IRPC {
    RPC: (url?: string, method?: 'POST' | 'GET') => (target: Object, properyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    RPCGateway: (url: string, method?: 'POST' | 'GET') => (target: any) => any;
}
if (!exports) exports = {};
let _module: IRPC = exports;
if (window) {
    //code for client;
    let rpcModule: IRPC = require('client.js');
    _module.RPC = rpcModule.RPC;
    _module.RPCGateway = rpcModule.RPCGateway;
}

if (process) {
    //code for nodejs;
    let rpcModule: IRPC = require('server.js');
    _module.RPC = rpcModule.RPC;
    _module.RPCGateway = rpcModule.RPCGateway;
}