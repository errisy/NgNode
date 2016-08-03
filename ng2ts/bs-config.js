"use strict";
var cgi = require('./cgi/cgi');
/// Export configuration options
cgi.__relativeRoot = __dirname;
module.exports = {
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
//# sourceMappingURL=bs-config.js.map