"use strict";
//a simple node server
const http = require('http');
const url = require('url');
const fs = require('fs');
const vm = require('vm');
const mime_1 = require('./mime');
var NodeServer;
(function (NodeServer) {
    class HttpService {
        constructor(port) {
            this.port = 48524;
            this.middleWares = [];
            this.handler = (request, response) => {
                let middleWareIndex = 0;
                let shouldTryNext = true;
                let link = url.parse(request.url);
                let next = () => {
                    middleWareIndex += 1;
                    shouldTryNext = true;
                };
                while (shouldTryNext) {
                    let route = this.middleWares[middleWareIndex].route;
                    if (route) {
                        route.lastIndex = -1;
                        if (route.test(link.path)) {
                            this.middleWares[middleWareIndex].handler(request, response, next);
                        }
                        else {
                            next();
                        }
                    }
                    else {
                        this.middleWares[middleWareIndex].handler(request, response, next);
                    }
                }
                if (!response.statusCode) {
                    response.writeHead(500, {
                        "Content-Type": "application/octet-stream"
                    });
                    response.end('The request can not be processed by the server.');
                }
            };
            //private handlers: HttpHandler[] = [];
            //public addHandler = (handler: HttpHandler) => {
            //    if (!handler.route) {
            //        handler.route = '\/';
            //    }
            //    if (handler.route.indexOf('\/') != 0) {
            //        handler.route = '\/' + handler.route;
            //    }
            //    if (!handler.method) {
            //        handler.method = 'GET';
            //    }
            //    if (handler.action) {
            //        this.handlers.push(handler);
            //    }
            //}
            this.start = () => {
                this.server = http.createServer(this.handler);
                this.server.listen(this.port);
            };
            if (port)
                if (typeof port == 'number')
                    this.port = port;
        }
    }
    function Response404(response, path) {
        response.writeHead(404, {
            "Content-Type": "text/plain"
        });
        response.end('File ' + path + ' can not be found on the server.');
    }
    class FileMiddleware {
        constructor() {
            this.handler = (request, response, next) => {
                let link = url.parse(request.url);
                let filename = process.execPath + link.path;
                fs.exists(filename, exists => {
                    if (exists) {
                        fs.stat(filename, (err, stats) => {
                            if (err) {
                                Response404(response, link.path);
                            }
                            else {
                                if (stats.isFile()) {
                                    let mimes = mime_1.mime.lookup(filename);
                                    if (mimes.length > 0) {
                                        response.writeHead(200, {
                                            "Content-Type": mimes[0].MIME,
                                            "Content-Length": stats.size
                                        });
                                    }
                                    else {
                                        response.writeHead(200, {
                                            "Content-Type": "application/octet-stream",
                                            "Content-Length": stats.size
                                        });
                                    }
                                    let readStream = fs.createReadStream(filename);
                                    readStream.pipe(response);
                                }
                                else {
                                    Response404(response, link.path);
                                }
                            }
                        });
                    }
                    else {
                        Response404(response, link.path);
                    }
                });
            };
        }
    }
    class pathreducer {
        static reduce(path) {
            return path.replace(/[^\\^\/^\:]+[\\\/]+\.\.[\\\/]+/ig, '').replace(/([^\:])[\\\/]{2,}/ig, (capture, ...args) => {
                return args[0] + '\/';
            }).replace(/\.[\\\/]+/ig, '');
        }
        static filename(path) {
            let index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            if (index > -1)
                return path.substr(index + 1);
            return path;
        }
        static pathname(path) {
            let index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            //console.log('[pathreducer]->pathaname: ', path, index, path.length);
            if (index > -1)
                return path.substr(0, index + 1);
            return path;
        }
    }
    let __relativeRoot = process.execPath;
    /**
     * Dynamically load and run a script in a try-catch block. This is great for debugging.
     * @param fileName The script file name with relative path. e.g. "../app/testModule". '.js' will be added to the end of the file name.
     * @param directoryName The directory where the script file is located. By default it is the root directory.
     */
    function DynamicRequire(fileName, directoryName) {
        try {
            if (!directoryName)
                directoryName = __relativeRoot;
            console.log('DynamicRequire: ', fileName, ' Base Path: ' + directoryName);
            let required = {};
            let requiredIndex = 0;
            let fullFilename = pathreducer.reduce(directoryName + '//' + fileName);
            if (fs.existsSync(fullFilename)) {
                if (fs.statSync(fullFilename).isFile()) {
                    let code = '(function (){\ntry{\n\texports = {};\n' +
                        fs.readFileSync(fullFilename).toString()
                            .replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, (capture, ...args) => {
                            let $file = pathreducer.reduce(directoryName + '//' + args[0] + '.js');
                            required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
                            let replacement = '$__required[' + requiredIndex + ']';
                            requiredIndex += 1;
                            return replacement;
                        }) +
                        '\n\treturn exports;\n}\ncatch(ex){\n\tconsole.log("Error:", ex);\n}\n})';
                    let context = vm.createContext({
                        console: console,
                        require: require,
                        __dirname: directoryName,
                        __filename: __filename,
                        process: process,
                        $__required: required
                    });
                    let _script = vm.createScript(code);
                    let fn = _script.runInContext(context);
                    let exported = fn();
                    if (exported['__relativeRoot'])
                        exported['__relativeRoot'] = __relativeRoot;
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
    NodeServer.DynamicRequire = DynamicRequire;
    class CGIMiddleware {
        constructor() {
            this.handler = (req, res, next) => {
                let _url = url.parse(req.url);
                //console.log(_url);
                if (req.url.indexOf('.cgi.js') > -1) {
                    let scriptFile = pathreducer.reduce(__relativeRoot + '\/' + _url.pathname);
                    console.log('CGI Script:', scriptFile);
                    let $directory = pathreducer.pathname(scriptFile);
                    if (fs.existsSync(scriptFile)) {
                        if (fs.statSync(scriptFile).isFile()) {
                            fs.readFile(scriptFile, (err, data) => {
                                let required = {};
                                let requiredIndex = 0;
                                try {
                                    let code = '(function (request, response, next){\ntry{\n'
                                        + data.toString().replace(/require\s*\(\s*[\'"]\s*\[\s*(\w+)\s*\]\s*[\'"]\s*\)/ig, (capture, ...args) => {
                                            return args[0];
                                        }).replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, (capture, ...args) => {
                                            //console.log('Replacing: ', capture);
                                            let $file = pathreducer.reduce($directory + '//' + args[0] + '.js');
                                            required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
                                            let replacement = '$__required[' + requiredIndex + ']';
                                            requiredIndex += 1;
                                            return replacement;
                                        }) +
                                        '\n}\ncatch(ex){\n\tconsole.log("Error:", ex);\n\tresponse.statusCode = 500;\n\tresponse.end(ex.toString()); \n}\n})';
                                    //console.log(code);
                                    let context = vm.createContext({
                                        console: console,
                                        require: require,
                                        __dirname: $directory,
                                        __filename: scriptFile,
                                        process: process,
                                        $__required: required
                                    });
                                    let _script = vm.createScript(code);
                                    let fn = _script.runInContext(context);
                                    fn(req, res, next);
                                }
                                catch (ex) {
                                    console.log(ex);
                                    res.writeHead(500, {
                                        "Content-Type": "text/plain"
                                    });
                                    res.end(ex);
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
            };
        }
    }
    let ptnRPCMethod = /([\w\.]+)\-([&@]?)(\w+)/; //[@: get &: set null:method]
    function Receive(request, callback) {
        let body = "";
        request.on('data', function (chunk) {
            body += chunk;
        });
        request.on('end', function () {
            if (callback)
                callback(JSON.parse(body));
        });
    }
    NodeServer.Receive = Receive;
    // References is the dictionary that hold all loaded library;
    let References = {};
    function Deserialize(jsonObject) {
        if (typeof jsonObject != 'object')
            return jsonObject;
        if (Array.isArray(jsonObject)) {
            console.log('Deserialize Array: ', JSON.stringify(jsonObject));
            for (let i = 0; i < jsonObject.length; i++) {
                jsonObject.push(Deserialize(jsonObject[i]));
            }
        }
        if (jsonObject['@Serializable.ModuleName'] && jsonObject['@Serializable.TypeName']) {
            console.log('Deserialize Object: ', JSON.stringify(jsonObject));
            let moduleName = jsonObject['@Serializable.ModuleName'];
            let typeName = jsonObject['@Serializable.TypeName'];
            //load module to References
            if (moduleName.charAt(0) == '.') {
                //this is a relative file;
                // if the module was not loaded, load it from the module file;
                if (!References[moduleName]) {
                    let $file = pathreducer.reduce(__relativeRoot + '\/' + moduleName + '.js');
                    console.log('Deserialize->Load Type Def from: ', $file);
                    References[moduleName] = DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
                }
            }
            else {
            }
            //how to obtain the module and type from it?
            let obj = new References[moduleName][typeName]();
            for (let key in jsonObject) {
                if (key != '$$hashKey')
                    obj[key] = jsonObject[key];
            }
            return obj;
        }
        return jsonObject;
    }
    NodeServer.Deserialize = Deserialize;
    class RPCMiddleware {
        constructor() {
            this.handler = (request, response, next) => {
                let link = url.parse(request.url);
                let filename = process.execPath + link.path;
                fs.exists(filename, exists => {
                    if (exists) {
                        fs.stat(filename, (err, stats) => {
                            if (err) {
                                Response404(response, link.path);
                            }
                            else {
                                if (stats.isFile()) {
                                    Receive(request, (data) => {
                                        ptnRPCMethod.lastIndex = -1;
                                        let matches = ptnRPCMethod.exec(link.search);
                                        let className = matches[1];
                                        let memberType = matches[2];
                                        let paramaters = Deserialize(data);
                                        let memberName = matches[3];
                                        let scriptFile = pathreducer.reduce(__relativeRoot + '\/' + link.pathname);
                                        console.log('CGI Script:', scriptFile);
                                        let $directory = pathreducer.pathname(scriptFile);
                                        fs.readFile(scriptFile, (err, data) => {
                                            let required = {};
                                            let requiredIndex = 0;
                                            try {
                                                let code = '(function (request, response, next){\ntry{\n'
                                                    + data.toString().replace(/require\s*\(\s*[\'"]\s*\[\s*(\w+)\s*\]\s*[\'"]\s*\)/ig, (capture, ...args) => {
                                                        return args[0];
                                                    }).replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, (capture, ...args) => {
                                                        //console.log('Replacing: ', capture);
                                                        let $file = pathreducer.reduce($directory + '//' + args[0] + '.js');
                                                        required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
                                                        let replacement = '$__required[' + requiredIndex + ']';
                                                        requiredIndex += 1;
                                                        return replacement;
                                                    }) +
                                                    'return = new ' + className + '();\nt' +
                                                    '\n}\ncatch(ex){\n\tconsole.log("Error:", ex);\n\tresponse.statusCode = 500;\n\tresponse.end(ex.toString()); \n}\n})';
                                                //console.log(code);
                                                let context = vm.createContext({
                                                    console: console,
                                                    require: require,
                                                    __dirname: $directory,
                                                    __filename: scriptFile,
                                                    process: process,
                                                    $__required: required
                                                });
                                                let _script = vm.createScript(code);
                                                let fn = _script.runInContext(context);
                                                let $Object = fn();
                                                switch (memberType) {
                                                    case '@':
                                                        response.end(JSON.stringify($Object[memberName]));
                                                        break;
                                                    case '&':
                                                        $Object[memberName] = paramaters[0];
                                                        response.end('true');
                                                        break;
                                                    default:
                                                        response.end(JSON.stringify($Object[memberName]));
                                                        break;
                                                }
                                            }
                                            catch (ex) {
                                                console.log(ex);
                                                response.writeHead(500, {
                                                    "Content-Type": "text/plain"
                                                });
                                                response.end(ex);
                                            }
                                        });
                                    });
                                }
                                else {
                                    Response404(response, link.path);
                                }
                            }
                        });
                    }
                    else {
                        Response404(response, link.path);
                    }
                });
            };
        }
    }
    let server = new HttpService();
    server.middleWares.push(new CGIMiddleware());
    server.middleWares.push(new RPCMiddleware());
    server.middleWares.push(new FileMiddleware());
    server.start();
})(NodeServer || (NodeServer = {}));
