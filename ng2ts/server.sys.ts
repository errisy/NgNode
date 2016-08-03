//a simple node server
import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as vm from 'vm';
import * as net from 'net';
import * as child_process from 'child_process';

import {mime} from './mime.sys';

module NodeServer {
    class HttpService {
        public port: number = 48524;
        public server: http.Server;
        constructor(port?: number) {
            if (port) if (typeof port == 'number') this.port = port;

        }
        public middleWares: IMiddleware[] = [];
        private handler = (request: http.ServerRequest, response: http.ServerResponse) => {
            let middleWareIndex: number = 0;
            let link = url.parse(request.url);
            //console.log(link);
            let tryNext = () => {
                console.log('trying', middleWareIndex);
                let route = this.middleWares[middleWareIndex].route;
                if (route) {
                    route.lastIndex = -1;
                    if (route.test(link.pathname)) {
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
            let next = () => {
                middleWareIndex += 1;
                if (middleWareIndex < this.middleWares.length) {
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
        private checkPort = (callback: () => void) => {
            let tester = net.createServer();
            let that = this;
            tester.once('error', (err: NodeJS.ErrnoException) => {
                if (err.code == 'EADDRINUSE') {
                    //try later 
                    console.log('Port ' + this.port + ' is not Free. Server will try again in 0.5 sec ...');
                    setTimeout(()=>that.checkPort(callback), 500);
                }
            });
            tester.once('listening', () => {
                console.log('Port ' + this.port + ' is Free. Starting HTTP Server...');
                tester.close();
                callback();
            });
            tester.listen(this.port);
        }
        public start = () => {
            this.checkPort(this.startServer);
        }
        private startServer = () => {
            this.server = http.createServer(this.handler);
            this.server.listen(this.port);
        }
        public stop = () => {
            this.server.close();
        }
    }
    //interface HttpHandler {
    //    route?: string;
    //    method?: 'GET' | 'POST' | 'PUT';
    //    data: 'TEXT' | 'JSON' | 'XML';
    //    action: (req: http.IncomingMessage, res: http.ServerResponse, ...args: any[]) => void;
    //}
    //class JsonHandler<T> implements HttpHandler {
    //    public data: 'TEXT' | 'JSON' | 'XML' = 'JSON';
    //    action: (req: http.IncomingMessage, res: http.ServerResponse, json: T) => void;
    //}
    interface IMiddleware {
        route: RegExp;
        handler: (request: http.ServerRequest, response: http.ServerResponse, next: () => void) => void;
    }
    function Response404(response: http.ServerResponse, path: string) {
        response.writeHead(404, {
            "Content-Type": "text/plain"
        });
        response.end('File ' + path + ' can not be found on the server.');
    }
    class FileMiddleware implements IMiddleware {
        /**
        * If route is not set, this Middleware will affect all requests. Otherwise, this Middleware will only affect defined route;
        */
        route: RegExp;
        handler = (request: http.ServerRequest, response: http.ServerResponse, next: () => void) => {
            console.log('trying file middleware');
            let link = url.parse(request.url);
            let filename = __dirname + decodeURI(link.path);
            console.log('filename', filename);
            fs.exists(filename, exists => {
                if (exists) {
                    fs.stat(filename, (err, stats) => {
                        if (err) {
                            next();
                        }
                        else {
                            if (stats.isFile()) {
                                let mimes = mime.lookup(filename);
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
        }
    }
    class DirectoryMiddleware implements IMiddleware {
        route: RegExp;
        handler = (request: http.ServerRequest, response: http.ServerResponse, next: () => void) => {
            console.log('trying directory middleware');
            let link = url.parse(request.url);
            let filename = __dirname + decodeURI(link.path);
            console.log('filename', filename);
            fs.exists(filename, exists => {
                if (exists) {
                    fs.stat(filename, (err, stats) => {
                        if (err) {
                            next();
                        }
                        else {
                            if (stats.isDirectory()) {
                                response.writeHead(200, {
                                    "Content-Type": "text/html"
                                });
                                fs.readdir(filename, (err, files) => {
                                    let pathname = pathreducer.toPathname(decodeURI(link.path));
                                    let result = '<html>\n\
 <head>\n\
  <title>Index of /</title>\n\
  <meta charset="UTF-8">\
 </head>\n\
 <body>\n\
<h1>Index of '+ pathname+'</h1>\n\
<ul>\n' +
                                        files.map(file => '\t<li><a href="' + (pathname + file).replace(/\\/ig, '\\\\') + '">' + file + '</a></li>\n').join('') +
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
        }
    }
    class pathreducer {
        static reduce(path: string) {
            return path.replace(/[^\\^\/^\:]+[\\\/]+\.\.[\\\/]+/ig, '').replace(/([^\:])[\\\/]{2,}/ig, (capture: string, ...args: string[]) => {
                return args[0] + '\/';
            }).replace(/\.[\\\/]+/ig, '');
        }
        static filename(path: string) {
            let index = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            if (index > -1) return path.substr(index + 1);
            return path;
        }
        static pathname(path: string) {
            let index: number = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            //console.log('[pathreducer]->pathaname: ', path, index, path.length);
            if (index == path.length -1) return path.substr(0, index + 1);
            return path;
        }
        static file2pathname(path: string) {
            let index: number = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            //console.log('[pathreducer]->pathaname: ', path, index, path.length);
            if (index > - 1) return path.substr(0, index + 1);
            return path;
        }
        static toPathname(path: string) {
            let index: number = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('\/'));
            if (index < path.length-1) return path + '/';
            return path;
        }
    }
    let __relativeRoot = __dirname;
    /**
     * Dynamically load and run a script in a try-catch block. This is great for debugging.
     * @param fileName The script file name with relative path. e.g. "../app/testModule". '.js' will be added to the end of the file name.
     * @param directoryName The directory where the script file is located. By default it is the root directory.
     */
    export function DynamicRequire(fileName: string, directoryName?: string) {
        try {
            if (!directoryName) directoryName = __relativeRoot;
            console.log('DynamicRequire: ', fileName, ' Base Path: ' + directoryName);
            let required: { [id: number]: any } = {};
            let requiredIndex: number = 0;
            let fullFilename: string = pathreducer.reduce(directoryName + '//' + fileName);
            if (fs.existsSync(fullFilename)) {
                if (fs.statSync(fullFilename).isFile()) {
                    let code = '(function (){\ntry{\n\tvar exports = {};\n' +
                        fs.readFileSync(fullFilename).toString()
                            .replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, (capture: string, ...args: any[]) => {
                                //let $file = pathreducer.reduce(directoryName + '//' + args[0] + '.js');
                                let $modulePath: string = args[0];
                                let $file: string;
                                if ($modulePath.charAt[0] == '.') {
                                    $file = pathreducer.reduce(directoryName + '//' + args[0] + '.js');
                                }
                                else {
                                    $file = pathreducer.reduce(directoryName + '/node_modules/' + args[0] + '/index.js');
                                }
                                required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                                let replacement = '$__required[' + requiredIndex + ']';
                                requiredIndex += 1;
                                return replacement;
                            }) +
                        '\n\treturn exports;\n}\ncatch(ex){\n\tconsole.log("Error:", ex, "@' + fullFilename.replace(/\\/ig, '\\\\') + '");\n}\n})';
                    let context = vm.createContext({
                        console: console,
                        require: require,
                        __dirname: directoryName,
                        __filename: __filename,
                        process: process,
                        $__required: required
                    });
                    let _script = vm.createScript(code);
                    let fn: Function = _script.runInContext(context);
                    let exported: any = fn();
                    if (!exported) console.log('Exported is undefined: ', fullFilename);
                    if (exported['__relativeRoot']) exported['__relativeRoot'] = __relativeRoot;
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
    /**
     * This is a task stack that accepts task request from request for high performance tasks running in child process.
     * You shall use task when *.cgi.js or *.rpc.js can not handle the request in synchronized manner (e.g. taking to long time to complete);
     */
    class TaskHost {
        private creationCount: number = 0;
        private tasksToRun: TaskInfo[] = [];
        private tasksRunning: TaskInfo[] = [];
        private tasksCompleted: TaskInfo[] = [];
        /** Create a task and return the task id.*/
        public createTask = (job: string, args: string[], obj: string): string => {
            //console.log('create task.');
            this.creationCount += 1;
            let info: TaskInfo = {
                id: this.creationCount.toString(),
                filename: job,
                args: args,
                status: 'Scheduled',
                obj: obj
            }
            this.tasksToRun.push(info);
            return info.id;
        }
        /** Cancel the task is scheduled or started*/
        public cancelTask = (id: string):void => {
            let available: TaskInfo[] = [];
            this.tasksToRun.forEach(task => available.push(task));
            this.tasksRunning.forEach(task => available.push(task));
            available.filter(task => task.id == id).forEach(task => {
                try {
                    task.process.pid && task.process.kill && task.process.kill();
                }
                catch (ex) {
                    
                }
            });
        }
        public start = () => {
            //console.log('task start.');
            while (this.tasksToRun.length > 0) {
                let task = this.tasksToRun.shift();
                task.starttime = Number(new Date());
                this.tasksRunning.push(task);
                let that = this;
                console.log('starting task');
                task.process = child_process.fork(task.filename + '.sys.js', task.args);
                task.process.on('message', (data: string ) => {
                    console.log('Task ' + task.id + ' - progress :', data);
                    task.progress = data;
                });
                //task.process.emit('message', task.obj);
                task.process.send(task.obj);
                task.process.on('exit', () => {
                    console.log('Task ' + task.id + ' has completed.');
                    that.tasksCompleted.push(that.tasksRunning.splice(that.tasksRunning.indexOf(task), 1)[0]);
                });
            }
        }
        private onStatusUpdate = () => {
            
        }
        public checkStatus = (id: string): TaskInfo => {
            let target: TaskInfo;
            if (this.tasksToRun.some(task => {
                if (task.id == id) {
                    target = task;
                    return true;
                }
            }) &&
                this.tasksToRun.some(task => {
                    if (task.id == id) {
                        target = task;
                        return true;
                    }
                }) &&
                this.tasksToRun.some(task => {
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
            
        }
    }
    interface TaskInfo {
        id: string;
        filename: string;
        status?: 'Scheduled'|'Running'|'Error'|'Completed';
        progress?: string;
        /**start time in milliseconds from 1970-1-1 00:00:00*/
        starttime?: number;
        /**start time in milliseconds from 1970-1-1 00:00:00*/
        endtime?: number;
        process?: child_process.ChildProcess;
        args?: string[];
        obj?: any;
    }
    let ServerTaskHost = new TaskHost();
    /**
     * CGI Middleware will process pathname with *.cgi.js
     * By using vm and DynamicRequire, CGIMiddleware reads the js file from disk for each request.
     * It can be optimized by load them with require, well the files must be modified anyway;
     */
    class CGIMiddleware implements IMiddleware {
        route: RegExp = /\.cgi\.js$/;
        handler = (request: http.ServerRequest, response: http.ServerResponse, next: Function) => {
            let _url: url.Url = url.parse(decodeURI(request.url));
            //console.log(_url);

            if (request.url.indexOf('.cgi.js') > -1) {
                let scriptFile = pathreducer.reduce(__relativeRoot + '\/' + _url.pathname);
                console.log('CGI Script:', scriptFile);
                let $directory = pathreducer.file2pathname(scriptFile);
                if (fs.existsSync(scriptFile)) {
                    if (fs.statSync(scriptFile).isFile()) {
                        fs.readFile(scriptFile, (err: NodeJS.ErrnoException, data: Buffer) => {
                            let required: { [id: number]: any } = {};
                            let argumentlist: { [id: string]: any } = {};
                            let requiredIndex: number = 0;
                            try {
                                argumentlist['request'] = request;
                                argumentlist['response'] = response;
                                argumentlist['next'] = next;
                                argumentlist['tasks'] = ServerTaskHost;
                                let code = '(function (){\ntry{\n'
                                    + data.toString().replace(/require\s*\(\s*[\'"]\s*\[\s*(\w+)\s*\]\s*[\'"]\s*\)/ig, (capture: string, ...args: any[]) => {
                                    return '$__arguments["'+ args[0] +'"]';
                                    }).replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, (capture: string, ...args: any[]) => {
                                        //console.log('Replacing: ', capture);
                                        let $file = pathreducer.reduce($directory + '\/' + args[0] + '.js');

                                        console.log('dynamic require directory: ', $file);
                                        required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                                        let replacement = '$__required[' + requiredIndex + ']';
                                        requiredIndex += 1;
                                        return replacement;
                                    }) +
                                    '\n}\ncatch(ex){\n\tconsole.log("Error:", ex, "@' + scriptFile +  '");\n\tresponse.statusCode = 500;\n\tresponse.end(ex.toString()); \n}\n})';
                                console.log(code);
                                let context = vm.createContext({
                                    console: console,
                                    require: require,
                                    __dirname: $directory,
                                    __filename: scriptFile,
                                    process: process,
                                    $__arguments: argumentlist,
                                    $__required: required
                                });
                                let _script = vm.createScript(code);
                                let fn: Function = _script.runInContext(context);
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
                //console.log("route api:", $file);
            }
            else {
                next();
            }
        };
    }
    let ptnRPCMethod = /([\w\.]+)([&@\-]?)(\w+)/; //[@: get &: set null:method]
    interface IRPCScript {
        (): { [id: string]: Function };
    }
    export function Receive(request: http.ServerRequest, callback: (data: any) => void) {
        if (request.method.toUpperCase() == 'POST') {
            let body = "";
            request.on('data', function (chunk: string) {
                body += chunk;
            });
            request.on('end', function () {
                if (callback) callback(JSON.parse(body));
            })
        }
        else {
            callback(JSON.parse('{}'));
        }
    }
    // References is the dictionary that hold all loaded library;
    let References: { [id: string]: { [id: string]: ObjectConstructor } } = {};
    export function Deserialize(jsonObject: any): any {
        if (typeof jsonObject != 'object') return jsonObject;
        if (Array.isArray(jsonObject)) {
            console.log('Deserialize Array: ', JSON.stringify(jsonObject));
            
            for (let i = 0; i < (<any[]>jsonObject).length; i++) {
                (<any[]>jsonObject)[i] = Deserialize((<any[]>jsonObject)[i]);
            }
        }
        if (jsonObject['@Serializable.ModuleName'] && jsonObject['@Serializable.TypeName']) {
            console.log('Deserialize Object: ', JSON.stringify(jsonObject));
            let moduleName: string = jsonObject['@Serializable.ModuleName'];
            let typeName: string = jsonObject['@Serializable.TypeName'];
            //load module to References
            if (moduleName.charAt(0) == '/') {
                //this is a relative file;
                // if the module was not loaded, load it from the module file;
                console.log('__relativeRoot: ', __relativeRoot);
                if (!References[moduleName]) {
                    let $file = pathreducer.reduce(__relativeRoot + moduleName + '.js');
                    console.log('Deserialize->Load Type Def from: ', $file);
                    References[moduleName] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                }
            }
            else {
                //this is a type from module
                References[moduleName] = require(moduleName);
            }

            //how to obtain the module and type from it?
            let obj = new References[moduleName][typeName]();
            console.log('obj built: ', moduleName, typeName, obj);
            for (let key in jsonObject) {
                if (key != '$$hashKey')
                    obj[key] = Deserialize(jsonObject[key]);
            }
            return obj;
        }
        return jsonObject;
    }
    /**
     * RPC middleware will capture pathname with *.rpc.js, and wrap *.rpc.js with a function so as to obtain the service $Object.
     * Then we will call $Object[memberName].apply($Object, parameters) to invoke the method to produce response objects for the request.
     * vm is used to invoke the code dynamically, any modification will be read by the server. The drawback is its relatively lower performance.
     * If the service is considered stable, the *.rpc.js should be converted to js file and loaded by 'require' for reuse;
     */
    class RPCMiddleware implements IMiddleware {
        route: RegExp = /\.rpc\.js$/;
        handler = (request: http.ServerRequest, response: http.ServerResponse, next: () => void) => {
            let link = url.parse(decodeURI(request.url));
            let filename = __dirname + link.pathname;
            //console.log('RPC: ', filename);
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
                                    console.log('rpc deserialize.');
                                    let paramaters: any[] = Deserialize(data);
                                    let memberName = matches[3];
                                    let scriptFile = pathreducer.reduce(__relativeRoot + '\/' + link.pathname);
                                    console.log('RPC Script:', scriptFile);
                                    let $directory = pathreducer.file2pathname(scriptFile);
                                    fs.readFile(scriptFile, (err: NodeJS.ErrnoException, data: Buffer) => {
                                        let required: { [id: number]: any } = {};
                                        let requiredIndex: number = 0;
                                        let argumentlist: { [id: string]: any } = {};
                                        try {
                                            argumentlist['request'] = request;
                                            argumentlist['response'] = response;
                                            argumentlist['next'] = next;
                                            argumentlist['tasks'] = ServerTaskHost;
                                            let code = '(function (){\ntry{\n\tvar exports = {};\n'
                                                + data.toString().replace(/require\s*\(\s*[\'"]\s*\[\s*(\w+)\s*\]\s*[\'"]\s*\)/ig, (capture: string, ...args: any[]) => {
                                                return '$__arguments["' + args[0] + '"]';
                                                }).replace(/require\s*\(\s*[\'"](\.+[\/a-z_\-\s0-9\.]+)[\'"]\s*\)/ig, (capture: string, ...args: any[]) => {
                                                    //console.log('Replacing: ', capture);
                                                    let $file = pathreducer.reduce($directory + '//' + args[0] + '.js');
                                                    required[requiredIndex] = DynamicRequire(pathreducer.filename($file), pathreducer.file2pathname($file));
                                                    let replacement = '$__required[' + requiredIndex + ']';
                                                    requiredIndex += 1;
                                                    return replacement;
                                                }) +
                                                '\nreturn new ' + className + '();\n' +
                                                '\n}\ncatch(ex){\n\tconsole.log("Error:", ex, "@' + scriptFile.replace(/\\/ig, '\\\\') + '");\n\t$__arguments[\'response\'].statusCode = 500;\n\t$__arguments[\'response\'].end(ex.toString()); \n}\n})';
                                            console.log(code);
                                            let context = vm.createContext({
                                                console: console,
                                                require: require,
                                                __dirname: $directory,
                                                __filename: scriptFile,
                                                process: process,
                                                $__arguments: argumentlist,
                                                $__required: required
                                            });
                                            let _script = vm.createScript(code);
                                            let fn: IRPCScript = _script.runInContext(context);
                                            let $Object = fn();
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
        }
    }
    /**
     * This middleware blocks the user from accessing system files on the server;
     * *.sys.js files are server core scripts. they must be kept away from the user;
     */
    class SYSMiddleware implements IMiddleware {
        route = /\.sys\.js$/;
        handler = (request: http.ServerRequest, response: http.ServerResponse, next: () => void) => {
            let link = url.parse(request.url);
            Response404(response, link.path);
        }
    }
    let server = new HttpService(1018);
    server.middleWares.push(new SYSMiddleware());
    server.middleWares.push(new CGIMiddleware());
    server.middleWares.push(new RPCMiddleware());
    server.middleWares.push(new FileMiddleware());
    server.middleWares.push(new DirectoryMiddleware());
    server.start();
    //process.send && process.send('message'); how child process can send message to master
    //console.log('result sent');
}