"use strict";
//a simple node server
var http = require('http');
var url = require('url');
var fs = require('fs');
var vm = require('vm');
var net = require('net');
var child_process = require('child_process');
var mime_sys_1 = require('./mime.sys');
var NodeServer;
(function (NodeServer) {
    var HttpService = (function () {
        function HttpService(port) {
            var _this = this;
            this.port = 48524;
            this.middleWares = [];
            this.handler = function (request, response) {
                var middleWareIndex = 0;
                var link = url.parse(request.url);
                //console.log(link);
                var tryNext = function () {
                    console.log('trying', middleWareIndex);
                    var route = _this.middleWares[middleWareIndex].route;
                    if (route) {
                        route.lastIndex = -1;
                        if (route.test(link.pathname)) {
                            _this.middleWares[middleWareIndex].handler(request, response, next);
                        }
                        else {
                            next();
                        }
                    }
                    else {
                        _this.middleWares[middleWareIndex].handler(request, response, next);
                    }
                };
                var next = function () {
                    middleWareIndex += 1;
                    if (middleWareIndex < _this.middleWares.length) {
                        tryNext();
                    }
                    else {
                        console.log('all middleware tried', response.statusCode);
                        if (!response.statusCode) {
                            Response404(response, link.pathname);
                        }
                    }
                };
                tryNext();
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
            this.checkPort = function (callback) {
                var tester = net.createServer();
                var that = _this;
                tester.once('error', function (err) {
                    if (err.code == 'EADDRINUSE') {
                        //try later 
                        console.log('Port ' + _this.port + ' is not Free. Server will try again in 0.5 sec ...');
                        setTimeout(function () { return that.checkPort(callback); }, 500);
                    }
                });
                tester.once('listening', function () {
                    console.log('Port ' + _this.port + ' is Free. Starting HTTP Server...');
                    tester.close();
                    callback();
                });
                tester.listen(_this.port);
            };
            this.start = function () {
                _this.checkPort(_this.startServer);
            };
            this.startServer = function () {
                _this.server = http.createServer(_this.handler);
                _this.server.listen(_this.port);
            };
            this.stop = function () {
                _this.server.close();
            };
            if (port)
                if (typeof port == 'number')
                    this.port = port;
        }
        return HttpService;
    }());
    function Response404(response, path) {
        response.writeHead(404, {
            "Content-Type": "text/plain"
        });
        response.end('File ' + path + ' can not be found on the server.');
    }
    var FileMiddleware = (function () {
        function FileMiddleware() {
            this.handler = function (request, response, next) {
                console.log('trying file middleware');
                var link = url.parse(request.url);
                var filename = __dirname + decodeURI(link.path);
                console.log('filename', filename);
                fs.exists(filename, function (exists) {
                    if (exists) {
                        fs.stat(filename, function (err, stats) {
                            if (err) {
                                next();
                            }
                            else {
                                if (stats.isFile()) {
                                    var mimes = mime_sys_1.mime.lookup(filename);
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
                                    var readStream = fs.createReadStream(filename);
                                    readStream.pipe(response);
                                }
                                else {
                                    console.log('not file');
                                    next();
                                }
                            }
                        });
                    }
                    else {
                        next();
                    }
                });
            };
        }
        return FileMiddleware;
    }());
    var DirectoryMiddleware = (function () {
        function DirectoryMiddleware() {
            this.handler = function (request, response, next) {
                console.log('trying directory middleware');
                var link = url.parse(request.url);
                var filename = __dirname + decodeURI(link.path);
                console.log('filename', filename);
                fs.exists(filename, function (exists) {
                    if (exists) {
                        fs.stat(filename, function (err, stats) {
                            if (err) {
                                next();
                            }
                            else {
                                if (stats.isDirectory()) {
                                    response.writeHead(200, {
                                        "Content-Type": "text/html"
                                    });
                                    fs.readdir(filename, function (err, files) {
                                        var pathname = pathreducer.toPathname(decodeURI(link.path));
                                        var result = '<html>\n\
 <head>\n\
  <title>Index of /</title>\n\
  <meta charset="UTF-8">\
 </head>\n\
 <body>\n\
<h1>Index of ' + pathname + '</h1>\n\
<ul>\n' +
                                            files.map(function (file) { return '\t<li><a href="' + (pathname + file).replace(/\\/ig, '\\\\') + '">' + file + '</a></li>\n'; }).join('') +
                                            '</ul>\n\
<div>Simple Node Service</div>\
</body></html>';
                                        response.end(result);
                                    });
                                }
                                else {
                                    next();
                                }
                            }
                        });
                    }
                    else {
                        next();
                    }
                });
            };
        }
        return DirectoryMiddleware;
    }());
    var pathreducer = (function () {
        function pathreducer() {
        }
        pathreducer.reduce = function (path) {
            return path.replace(/[^\\^\/^\:]+[\\\/]+\.\.[\\\/]+/ig, '').replace(/([^\:])[\\\/]{2,}/ig, function (capture) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return args[0] + '\/';
            }).replace(/\.[\\\/]+/ig, '');
        };
        pathreducer.filename = function (path) {
            var index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            if (index > -1)
                return path.substr(index + 1);
            return path;
        };
        pathreducer.pathname = function (path) {
            var index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            //console.log('[pathreducer]->pathaname: ', path, index, path.length);
            if (index == path.length - 1)
                return path.substr(0, index + 1);
            return path;
        };
        pathreducer.file2pathname = function (path) {
            var index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            //console.log('[pathreducer]->pathaname: ', path, index, path.length);
            if (index > -1)
                return path.substr(0, index + 1);
            return path;
        };
        pathreducer.toPathname = function (path) {
            var index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            if (index < path.length - 1)
                return path + '/';
            return path;
        };
        return pathreducer;
    }());
    var __relativeRoot = __dirname;
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
            var required_1 = {};
            var requiredIndex_1 = 0;
            var fullFilename = pathreducer.reduce(directoryName + '//' + fileName);
            if (fs.existsSync(fullFilename)) {
                if (fs.statSync(fullFilename).isFile()) {
                    var code = '(function (){\ntry{\n\tvar exports = {};\n' +
                        fs.readFileSync(fullFilename).toString()
                            .replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, function (capture) {
                            var args = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                args[_i - 1] = arguments[_i];
                            }
                            //let $file = pathreducer.reduce(directoryName + '//' + args[0] + '.js');
                            var $modulePath = args[0];
                            var $file;
                            if ($modulePath.charAt[0] == '.') {
                                $file = pathreducer.reduce(directoryName + '//' + args[0] + '.js');
                            }
                            else {
                                $file = pathreducer.reduce(directoryName + '/node_modules/' + args[0] + '/index.js');
                            }
                            required_1[requiredIndex_1] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                            var replacement = '$__required[' + requiredIndex_1 + ']';
                            requiredIndex_1 += 1;
                            return replacement;
                        }) +
                        '\n\treturn exports;\n}\ncatch(ex){\n\tconsole.log("Error:", ex, "@' + fullFilename.replace(/\\/ig, '\\\\') + '");\n}\n})';
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
                    if (!exported)
                        console.log('Exported is undefined: ', fullFilename);
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
    /**
     * This is a task stack that accepts task request from request for high performance tasks running in child process.
     * You shall use task when *.cgi.js or *.rpc.js can not handle the request in synchronized manner (e.g. taking to long time to complete);
     */
    var TaskHost = (function () {
        function TaskHost() {
            var _this = this;
            this.creationCount = 0;
            this.tasksToRun = [];
            this.tasksRunning = [];
            this.tasksCompleted = [];
            /** Create a task and return the task id.*/
            this.createTask = function (job, args, obj) {
                //console.log('create task.');
                _this.creationCount += 1;
                var info = {
                    id: _this.creationCount.toString(),
                    filename: job,
                    args: args,
                    status: 'Scheduled',
                    obj: obj
                };
                _this.tasksToRun.push(info);
                return info.id;
            };
            /** Cancel the task is scheduled or started*/
            this.cancelTask = function (id) {
                var available = [];
                _this.tasksToRun.forEach(function (task) { return available.push(task); });
                _this.tasksRunning.forEach(function (task) { return available.push(task); });
                available.filter(function (task) { return task.id == id; }).forEach(function (task) {
                    try {
                        task.process.pid && task.process.kill && task.process.kill();
                    }
                    catch (ex) {
                    }
                });
            };
            this.start = function () {
                //console.log('task start.');
                var _loop_1 = function() {
                    var task = _this.tasksToRun.shift();
                    task.starttime = Number(new Date());
                    _this.tasksRunning.push(task);
                    var that = _this;
                    console.log('starting task');
                    task.process = child_process.fork(task.filename + '.sys.js', task.args);
                    task.process.on('message', function (data) {
                        console.log('Task ' + task.id + ' - progress :', data);
                        task.progress = data;
                    });
                    //task.process.emit('message', task.obj);
                    task.process.send(task.obj);
                    task.process.on('exit', function () {
                        console.log('Task ' + task.id + ' has completed.');
                        that.tasksCompleted.push(that.tasksRunning.splice(that.tasksRunning.indexOf(task), 1)[0]);
                    });
                };
                while (_this.tasksToRun.length > 0) {
                    _loop_1();
                }
            };
            this.onStatusUpdate = function () {
            };
            this.checkStatus = function (id) {
                var target;
                if (_this.tasksToRun.some(function (task) {
                    if (task.id == id) {
                        target = task;
                        return true;
                    }
                }) &&
                    _this.tasksToRun.some(function (task) {
                        if (task.id == id) {
                            target = task;
                            return true;
                        }
                    }) &&
                    _this.tasksToRun.some(function (task) {
                        if (task.id == id) {
                            target = task;
                            return true;
                        }
                    })) {
                    //only return part of the information;
                    //process will not be exposed to the cgi;
                    return {
                        id: target.id,
                        filename: target.filename,
                        status: target.status,
                        progress: target.progress,
                        starttime: target.starttime,
                        endtime: target.endtime
                    };
                }
                else {
                    return undefined;
                }
            };
        }
        return TaskHost;
    }());
    var ServerTaskHost = new TaskHost();
    /**
     * CGI Middleware will process pathname with *.cgi.js
     * By using vm and DynamicRequire, CGIMiddleware reads the js file from disk for each request.
     * It can be optimized by load them with require, well the files must be modified anyway;
     */
    var CGIMiddleware = (function () {
        function CGIMiddleware() {
            this.route = /\.cgi\.js$/;
            this.handler = function (request, response, next) {
                var _url = url.parse(decodeURI(request.url));
                //console.log(_url);
                if (request.url.indexOf('.cgi.js') > -1) {
                    var scriptFile_1 = pathreducer.reduce(__relativeRoot + '\/' + _url.pathname);
                    console.log('CGI Script:', scriptFile_1);
                    var $directory_1 = pathreducer.file2pathname(scriptFile_1);
                    if (fs.existsSync(scriptFile_1)) {
                        if (fs.statSync(scriptFile_1).isFile()) {
                            fs.readFile(scriptFile_1, function (err, data) {
                                var required = {};
                                var argumentlist = {};
                                var requiredIndex = 0;
                                try {
                                    argumentlist['request'] = request;
                                    argumentlist['response'] = response;
                                    argumentlist['next'] = next;
                                    argumentlist['tasks'] = ServerTaskHost;
                                    var code = '(function (){\ntry{\n'
                                        + data.toString().replace(/require\s*\(\s*[\'"]\s*\[\s*(\w+)\s*\]\s*[\'"]\s*\)/ig, function (capture) {
                                            var args = [];
                                            for (var _i = 1; _i < arguments.length; _i++) {
                                                args[_i - 1] = arguments[_i];
                                            }
                                            return '$__arguments["' + args[0] + '"]';
                                        }).replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, function (capture) {
                                            var args = [];
                                            for (var _i = 1; _i < arguments.length; _i++) {
                                                args[_i - 1] = arguments[_i];
                                            }
                                            //console.log('Replacing: ', capture);
                                            var $file = pathreducer.reduce($directory_1 + '\/' + args[0] + '.js');
                                            console.log('dynamic require directory: ', $file);
                                            required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                                            var replacement = '$__required[' + requiredIndex + ']';
                                            requiredIndex += 1;
                                            return replacement;
                                        }) +
                                        '\n}\ncatch(ex){\n\tconsole.log("Error:", ex, "@' + scriptFile_1 + '");\n\tresponse.statusCode = 500;\n\tresponse.end(ex.toString()); \n}\n})';
                                    console.log(code);
                                    var context = vm.createContext({
                                        console: console,
                                        require: require,
                                        __dirname: $directory_1,
                                        __filename: scriptFile_1,
                                        process: process,
                                        $__arguments: argumentlist,
                                        $__required: required
                                    });
                                    var _script = vm.createScript(code);
                                    var fn = _script.runInContext(context);
                                    fn();
                                    //handle tasks. start tasks if there are any;
                                    ServerTaskHost.start();
                                }
                                catch (ex) {
                                    console.log(ex);
                                    response.writeHead(500, {
                                        "Content-Type": "text/plain"
                                    });
                                    response.end(ex);
                                }
                            });
                        }
                        else {
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.end('Error: The file does not exist in the server.');
                        }
                    }
                    else {
                        response.writeHead(500, {
                            "Content-Type": "text/plain"
                        });
                        response.end('Error: The file does not exist in the server.');
                    }
                }
                else {
                    next();
                }
            };
        }
        return CGIMiddleware;
    }());
    var ptnRPCMethod = /([\w\.]+)([&@\-]?)(\w+)/; //[@: get &: set null:method]
    function Receive(request, callback) {
        if (request.method.toUpperCase() == 'POST') {
            var body_1 = "";
            request.on('data', function (chunk) {
                body_1 += chunk;
            });
            request.on('end', function () {
                if (callback)
                    callback(JSON.parse(body_1));
            });
        }
        else {
            callback(JSON.parse('{}'));
        }
    }
    NodeServer.Receive = Receive;
    // References is the dictionary that hold all loaded library;
    var References = {};
    function Deserialize(jsonObject) {
        if (typeof jsonObject != 'object')
            return jsonObject;
        if (Array.isArray(jsonObject)) {
            console.log('Deserialize Array: ', JSON.stringify(jsonObject));
            for (var i = 0; i < jsonObject.length; i++) {
                jsonObject[i] = Deserialize(jsonObject[i]);
            }
        }
        if (jsonObject['@Serializable.ModuleName'] && jsonObject['@Serializable.TypeName']) {
            console.log('Deserialize Object: ', JSON.stringify(jsonObject));
            var moduleName = jsonObject['@Serializable.ModuleName'];
            var typeName = jsonObject['@Serializable.TypeName'];
            //load module to References
            if (moduleName.charAt(0) == '/') {
                //this is a relative file;
                // if the module was not loaded, load it from the module file;
                console.log('__relativeRoot: ', __relativeRoot);
                if (!References[moduleName]) {
                    var $file = pathreducer.reduce(__relativeRoot + moduleName + '.js');
                    console.log('Deserialize->Load Type Def from: ', $file);
                    References[moduleName] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                }
            }
            else {
                //this is a type from module
                References[moduleName] = require(moduleName);
            }
            //how to obtain the module and type from it?
            var obj = new References[moduleName][typeName]();
            console.log('obj built: ', moduleName, typeName, obj);
            for (var key in jsonObject) {
                if (key != '$$hashKey')
                    obj[key] = Deserialize(jsonObject[key]);
            }
            return obj;
        }
        return jsonObject;
    }
    NodeServer.Deserialize = Deserialize;
    /**
     * RPC middleware will capture pathname with *.rpc.js, and wrap *.rpc.js with a function so as to obtain the service $Object.
     * Then we will call $Object[memberName].apply($Object, parameters) to invoke the method to produce response objects for the request.
     * vm is used to invoke the code dynamically, any modification will be read by the server. The drawback is its relatively lower performance.
     * If the service is considered stable, the *.rpc.js should be converted to js file and loaded by 'require' for reuse;
     */
    var RPCMiddleware = (function () {
        function RPCMiddleware() {
            this.route = /\.rpc\.js$/;
            this.handler = function (request, response, next) {
                var link = url.parse(decodeURI(request.url));
                var filename = __dirname + link.pathname;
                //console.log('RPC: ', filename);
                fs.exists(filename, function (exists) {
                    if (exists) {
                        fs.stat(filename, function (err, stats) {
                            if (err) {
                                Response404(response, link.path);
                            }
                            else {
                                if (stats.isFile()) {
                                    Receive(request, function (data) {
                                        ptnRPCMethod.lastIndex = -1;
                                        var matches = ptnRPCMethod.exec(link.search);
                                        var className = matches[1];
                                        var memberType = matches[2];
                                        console.log('rpc deserialize.');
                                        var paramaters = Deserialize(data);
                                        var memberName = matches[3];
                                        var scriptFile = pathreducer.reduce(__relativeRoot + '\/' + link.pathname);
                                        console.log('RPC Script:', scriptFile);
                                        var $directory = pathreducer.file2pathname(scriptFile);
                                        fs.readFile(scriptFile, function (err, data) {
                                            var required = {};
                                            var requiredIndex = 0;
                                            var argumentlist = {};
                                            try {
                                                argumentlist['request'] = request;
                                                argumentlist['response'] = response;
                                                argumentlist['next'] = next;
                                                argumentlist['tasks'] = ServerTaskHost;
                                                var code = '(function (){\ntry{\n\tvar exports = {};\n'
                                                    + data.toString().replace(/require\s*\(\s*[\'"]\s*\[\s*(\w+)\s*\]\s*[\'"]\s*\)/ig, function (capture) {
                                                        var args = [];
                                                        for (var _i = 1; _i < arguments.length; _i++) {
                                                            args[_i - 1] = arguments[_i];
                                                        }
                                                        return '$__arguments["' + args[0] + '"]';
                                                    }).replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, function (capture) {
                                                        var args = [];
                                                        for (var _i = 1; _i < arguments.length; _i++) {
                                                            args[_i - 1] = arguments[_i];
                                                        }
                                                        //console.log('Replacing: ', capture);
                                                        var $file = pathreducer.reduce($directory + '//' + args[0] + '.js');
                                                        required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                                                        var replacement = '$__required[' + requiredIndex + ']';
                                                        requiredIndex += 1;
                                                        return replacement;
                                                    }) +
                                                    '\nreturn new ' + className + '();\n' +
                                                    '\n}\ncatch(ex){\n\tconsole.log("Error:", ex, "@' + scriptFile.replace(/\\/ig, '\\\\') + '");\n\t$__arguments[\'response\'].statusCode = 500;\n\t$__arguments[\'response\'].end(ex.toString()); \n}\n})';
                                                console.log(code);
                                                var context = vm.createContext({
                                                    console: console,
                                                    require: require,
                                                    __dirname: $directory,
                                                    __filename: scriptFile,
                                                    process: process,
                                                    $__arguments: argumentlist,
                                                    $__required: required
                                                });
                                                var _script = vm.createScript(code);
                                                var fn = _script.runInContext(context);
                                                var $Object = fn();
                                                console.log('Service-Method: ', className, memberName);
                                                console.log('Object: ', $Object);
                                                switch (memberType) {
                                                    case '@':
                                                        response.end(JSON.stringify($Object[memberName]));
                                                        break;
                                                    case '&':
                                                        $Object[memberName] = paramaters[0];
                                                        response.end('true');
                                                        break;
                                                    case '-':
                                                        response.end(JSON.stringify($Object[memberName].apply($Object, paramaters)));
                                                        break;
                                                }
                                                //handle tasks. start tasks if there are any;
                                                ServerTaskHost.start();
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
        return RPCMiddleware;
    }());
    /**
     * This middleware blocks the user from accessing system files on the server;
     * *.sys.js files are server core scripts. they must be kept away from the user;
     */
    var SYSMiddleware = (function () {
        function SYSMiddleware() {
            this.route = /\.sys\.js$/;
            this.handler = function (request, response, next) {
                var link = url.parse(request.url);
                Response404(response, link.path);
            };
        }
        return SYSMiddleware;
    }());
    var server = new HttpService(1018);
    server.middleWares.push(new SYSMiddleware());
    server.middleWares.push(new CGIMiddleware());
    server.middleWares.push(new RPCMiddleware());
    server.middleWares.push(new FileMiddleware());
    server.middleWares.push(new DirectoryMiddleware());
    server.start();
})(NodeServer || (NodeServer = {}));
//# sourceMappingURL=server.sys.js.map