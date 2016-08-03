"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function RPC(url, method) {
    //by default, this uses the parentGateway's URL;
    return function (target, properyKey, descriptor) {
        var originalMethod = descriptor.value;
        //target is the host Object
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            //this will just call the remove service to 
            var result = originalMethod.apply(args);
            return result;
        };
        return descriptor;
    };
}
exports.RPC = RPC;
function RPC2(url, method) {
    //by default, this uses the parentGateway's URL;
    return function (target, properyKey, descriptor) {
        var originalMethod = descriptor.value;
        //target is the host Object
        descriptor.value = (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            //this will just call the remove service to 
            var result = originalMethod.apply(args);
            return result;
        });
        return descriptor;
    };
}
exports.RPC2 = RPC2;
var U = (function () {
    function U() {
    }
    U.prototype.user = function (m) {
    };
    __decorate([
        RPC2(), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Number]), 
        __metadata('design:returntype', void 0)
    ], U.prototype, "user", null);
    return U;
}());
function RPCGateway(url, method) {
    return function (target) {
        // save a reference to the original constructor
        var original = target;
        // a utility function to generate instances of a class
        function construct(constructor, args) {
            var c = function () {
                return constructor.apply(this, args);
            };
            c.prototype = constructor.prototype;
            var instance = new c();
            instance['$rpcURL'] = url;
            return instance;
        }
        // the new constructor behaviour
        var f = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            console.log("New: " + original.name);
            return construct(original, args);
        };
        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;
        // return new constructor (will override original)
        return f;
    };
}
exports.RPCGateway = RPCGateway;
//# sourceMappingURL=client.js.map