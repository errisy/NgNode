"use strict";
var cgi = require('../cgi/cgi');
var path = require('path');
var pathreducer = require('pathreducer');
/**
 * You must provide a Module Name for the this Serializable decorator. It uses the Module Name to deserialize the object.
 * @param moduleName
 */
function Serializable(moduleName) {
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
            instance['@Serializable.ModuleName'] = moduleName;
            instance['@Serializable.TypeName'] = original.name;
            return instance;
        }
        // the new constructor behaviour
        var f = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            console.log("New: " + original.name + " : Serializable");
            return construct(original, args);
        };
        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;
        // return new constructor (will override original)
        return f;
    };
}
exports.Serializable = Serializable;
// References is the dictionary that hold all loaded library;
var References = {};
var __moduleRoot;
/**
 * This path is determined by path.dirname(require.main.filename). If you want to changed the default value, set a new value to it after require/import.
 */
exports.__relativeRoot = path.dirname(require.main.filename);
function Deserialize(jsonObject) {
    if (typeof jsonObject != 'object')
        return jsonObject;
    if (Array.isArray(jsonObject)) {
        console.log('Deserialize Array: ', JSON.stringify(jsonObject));
        for (var i = 0; i < jsonObject.length; i++) {
            jsonObject.push(Deserialize(jsonObject[i]));
        }
    }
    if (jsonObject['@Serializable.ModuleName'] && jsonObject['@Serializable.TypeName']) {
        console.log('Deserialize Object: ', JSON.stringify(jsonObject));
        var moduleName = jsonObject['@Serializable.ModuleName'];
        var typeName = jsonObject['@Serializable.TypeName'];
        //load module to References
        if (moduleName.charAt(0) == '.') {
            //this is a relative file;
            // if the module was not loaded, load it from the module file;
            if (!References[moduleName]) {
                var $file = pathreducer.reduce(exports.__relativeRoot + '\/' + moduleName + '.js');
                console.log('Deserialize->Load Type Def from: ', $file);
                References[moduleName] = cgi.DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
            }
        }
        else {
        }
        //how to obtain the module and type from it?
        var obj = new References[moduleName][typeName]();
        for (var key in jsonObject) {
            if (key != '$$hashKey')
                obj[key] = jsonObject[key];
        }
        return obj;
    }
    return jsonObject;
}
exports.Deserialize = Deserialize;
//# sourceMappingURL=serialization.js.map