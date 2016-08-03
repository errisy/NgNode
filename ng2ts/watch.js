"use strict";
var fs = require('fs');
var child_process = require('child_process');
if (!process.argv[0])
    process.exit();
var filename = process.argv[2];
var currentChild;
function killChild() {
    if (currentChild) {
        console.log('File changed => Kill process: ', currentChild.pid);
        currentChild.send('exit');
        //currentChild.kill();
        //currentChild.emit('exit');
        //currentChild.stderr.removeAllListeners();
        //currentChild.stdout.removeAllListeners();
        //currentChild.removeAllListeners();
        process.kill(currentChild.pid);
        currentChild = undefined;
    }
}
function executeFile() {
    console.log('Executing file: ', filename);
    currentChild = child_process.fork(filename); //'node ' + 
    //receive message from child;
    //currentChild.on('message', value => {
    //    console.log('result emitted: ', value);
    //});
}
fs.watchFile(filename, function (curr, prev) {
    killChild();
    if (fs.existsSync(filename))
        executeFile();
});
executeFile();
process.on('exit', function () {
    killChild();
});
//# sourceMappingURL=watch.js.map