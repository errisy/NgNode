"use strict";
var serialization_1 = require('./serialization');
/**
 * Register a member in a rpcService to work as cgi method;
 * @param target
 * @param propertyKey
 */
function rpcMember(target, // The prototype of the class
    propertyKey //,  The name of the method
    ) {
    console.log("MethodDecorator called on: ", target, propertyKey);
    //return descriptor;
}
exports.rpcMember = rpcMember;
/**
 * Register a class as rpcService so it will be converted to .service.ts and .cgi.ts by rpc service compiler;
 * the .cgi.ts will wrap the service to process http requests;
 * @param target
 */
function rpcService(target) {
    //doing nothing here;
}
exports.rpcService = rpcService;
var Converter = (function () {
    function Converter() {
    }
    /**
     * Convert string to string;
     * @param res
     */
    Converter.convertStringResponse = function (res) {
        return res.text();
    };
    /**
     * Convert response to json and deserialize it;
     * @param res
     */
    Converter.convertJsonResponse = function (res) {
        return serialization_1.Deserialize(res.json());
    };
    /**
     * Convert response from text to number value;
     * @param res
     */
    Converter.convertNumberResponse = function (res) {
        return Number(res.text());
    };
    /**
     * Convert response from text to boolean value;
     * @param res
     */
    Converter.convertBooleanResponse = function (res) {
        return Boolean(res.text());
    };
    return Converter;
}());
exports.Converter = Converter;
//# sourceMappingURL=rpc.js.map