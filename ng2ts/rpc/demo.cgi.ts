
import * as fs from 'fs';
import * as http from 'http';

//this is the one that works for cgi file pattern so as to avoid vm;
import * as CGI from './demo.rpc';
import * as RPC from './rpc';
import * as Util from './util';

let request: http.ServerRequest = require('[request]');
let response: http.ServerResponse = require('[response]');
let next: Function = require('[next]'); 

let prepareParameters = () => {
    console.log(request.url);
    let Path = Util.UrlParse(request);
    if (Path.Class) {
        if (Path.Member) {
            response.writeHead(200, {
                "Content-Type": "text/plain"
            });
            let $_ServiceObject = new CGI[Path.Class]();
            Util.Receive(request, ($parameters: any) => {
                let k = new CGI.Demo();
                let member: Function = $_ServiceObject[Path.Member];
                let result = member.apply($_ServiceObject, $parameters);
                response.end(JSON.stringify(result));
            });
        }
        else {
            die('invalid method name');
        }
    }
    else {
        die('invalid class name');
    }
}
let die = (msg: string) => {
    response.writeHead(500, {
        "Content-Type": "text/plain"
    });
    response.end(msg);
}
let stat = (err: NodeJS.ErrnoException, stats: fs.Stats) => {
    if (err) {
        die(err.message);
    }
    else {
        if (stats.isFile()) {
            prepareParameters();
        }
        else {
            die('is not a file');
        }
    }
}
let fileExists = (exists: boolean) => {
    if (exists) {
        fs.stat('demo.rpc.js', stat);
    }
    else {
        die('file does not exist;');
    }
};
fs.exists('demo.rpc.js', fileExists);