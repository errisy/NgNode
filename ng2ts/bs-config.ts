/// <reference path="./typings/globals/node/index.d.ts" />
/// <reference path="./typings/globals/browser-sync/index.d.ts" />
import * as fs from "fs";
import * as http from "http";
import * as url from "url";
import * as vm from "vm";
import * as BrowserSync from "browser-sync";
import * as cgi from './cgi/cgi';

/// Export configuration options
cgi.__relativeRoot = __dirname;
module.exports = <BrowserSync.Options>{
    files: ['./app/*.{html,htm,css,ts}'],
    server: {
        baseDir: "./"
    },
    middleware: [
        cgi.Middleware
    ],
    watchOptions: { ignored: ['node_modules'] },
    port: 3000
};