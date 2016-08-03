//this cgi module shall work for both client and server, which is a challenge;
"use strict";
var fs = require('fs');
var vm = require('vm');
var url = require('url');
//import * as path from 'path';
var pathreducer;
(function (pathreducer) {
    function reduce(path) {
        return path.replace(/[^\\^\/^\:]+[\\\/]+\.\.[\\\/]+/ig, '').replace(/([^\:])[\\\/]{2,}/ig, function (capture) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return args[0] + '\/';
        }).replace(/\.[\\\/]+/ig, '');
    }
    pathreducer.reduce = reduce;
    function filename(path) {
        var index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
        if (index > -1)
            return path.substr(index + 1);
        return path;
    }
    pathreducer.filename = filename;
    function pathname(path) {
        var index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
        //console.log('[pathreducer]->pathaname: ', path, index, path.length);
        if (index > -1)
            return path.substr(0, index + 1);
        return path;
    }
    pathreducer.pathname = pathname;
})(pathreducer = exports.pathreducer || (exports.pathreducer = {}));
/**
 * This path is determined by path.dirname(require.main.filename). If you want to changed the default value, set a new value to it after require/import.
 */
exports.__relativeRoot = __dirname;
/**
 * Dynamically load and run a script in a try-catch block. This is great for debugging.
 * @param fileName The script file name with relative path. e.g. "../app/testModule". '.js' will be added to the end of the file name.
 * @param directoryName The directory where the script file is located. By default it is the root directory.
 */
function DynamicRequire(fileName, directoryName) {
    try {
        if (!directoryName)
            directoryName = exports.__relativeRoot;
        console.log('DynamicRequire: ', fileName, ' Base Path: ' + directoryName);
        var required_1 = {};
        var requiredIndex_1 = 0;
        var fullFilename = pathreducer.reduce(directoryName + '//' + fileName);
        if (fs.existsSync(fullFilename)) {
            if (fs.statSync(fullFilename).isFile()) {
                var code = '(function (){\ntry{\n\texports = {};\n' +
                    fs.readFileSync(fullFilename).toString()
                        .replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, function (capture) {
                        var args = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args[_i - 1] = arguments[_i];
                        }
                        var $file = pathreducer.reduce(directoryName + '//' + args[0] + '.js');
                        required_1[requiredIndex_1] = DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
                        var replacement = '$__required[' + requiredIndex_1 + ']';
                        requiredIndex_1 += 1;
                        return replacement;
                    }) +
                    '\n\treturn exports;\n}\ncatch(ex){\n\tconsole.log("Error:", ex);\n}\n})';
                var context = vm.createContext({
                    console: console,
                    require: require,
                    __dirname: directoryName,
                    __filename: __filename,
                    process: process,
                    $__required: required_1
                });
                var _script = vm.createScript(code);
                var fn = _script.runInContext(context);
                var exported = fn();
                if (exported['__relativeRoot'])
                    exported['__relativeRoot'] = exports.__relativeRoot;
                return exported;
            }
            else {
                console.log('dynamicRequire Error: File not found - ' + fullFilename);
            }
        }
        else {
            console.log('dynamicRequire Error: File not found - ' + fullFilename);
        }
    }
    catch (ex) {
        console.log('dynamicRequire Error: ', ex);
    }
}
exports.DynamicRequire = DynamicRequire;
function Middleware(req, res, next) {
    var _url = url.parse(req.url);
    //console.log(_url);
    if (req.url.indexOf('.cgi.js') > -1) {
        var scriptFile_1 = pathreducer.reduce(exports.__relativeRoot + '\/' + _url.pathname);
        console.log('CGI Script:', scriptFile_1);
        var $directory_1 = pathreducer.pathname(scriptFile_1);
        if (fs.existsSync(scriptFile_1)) {
            if (fs.statSync(scriptFile_1).isFile()) {
                fs.readFile(scriptFile_1, function (err, data) {
                    var required = {};
                    var requiredIndex = 0;
                    try {
                        var code = '(function (request, response, next){\ntry{\n'
                            + data.toString().replace(/require\s*\(\s*[\'"]\s*\[\s*(\w+)\s*\]\s*[\'"]\s*\)/ig, function (capture) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                return args[0];
                            }).replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, function (capture) {
                                var args = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args[_i - 1] = arguments[_i];
                                }
                                //console.log('Replacing: ', capture);
                                var $file = pathreducer.reduce($directory_1 + '//' + args[0] + '.js');
                                required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
                                var replacement = '$__required[' + requiredIndex + ']';
                                requiredIndex += 1;
                                return replacement;
                            }) +
                            '\n}\ncatch(ex){\n\tconsole.log("Error:", ex);\n\tresponse.statusCode = 500;\n\tresponse.end(ex.toString()); \n}\n})';
                        //console.log(code);
                        var context = vm.createContext({
                            console: console,
                            require: require,
                            __dirname: $directory_1,
                            __filename: scriptFile_1,
                            process: process,
                            $__required: required
                        });
                        var _script = vm.createScript(code);
                        var fn = _script.runInContext(context);
                        fn(req, res, next);
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                });
            }
            else {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                res.end('Error: The file does not exist in the server.');
            }
        }
        else {
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.end('Error: The file does not exist in the server.');
        }
    }
    else {
        next();
    }
}
exports.Middleware = Middleware;
;
//if (module!==undefined) module.exports = exports; 
//# sourceMappingURL=cgi.js.map