"use strict";
var http = require('http');
var jquery_1 = require('jquery');
var ev = {
    keywords: 'science[journal] AND breast cancer AND 2008'
};
console.log('message from master: ', ev.keywords);
var options = {
    protocol: 'http:',
    host: 'eutils.ncbi.nlm.nih.gov',
    port: 80,
    path: '/entrez/eutils/esearch.fcgi?db=pubmed&' + ev.keywords.split(' ').join('+')
};
var client = http.request(options, function (res) {
    var stream = '';
    res.on('data', function (value) {
        console.log('data receiving: ', value);
        stream += value;
    });
    res.on('end', function (value) {
        stream += value;
        analyze(stream);
    });
});
client.end();
function analyze(stream) {
    console.log(stream);
    var xml = jquery_1.jQuery(stream);
    var idList = [];
    xml.children('IdList').children('Id').each(function (index, elem) {
        idList.push(elem.innerHTML);
    });
    console.log(idList);
}
//process.send({ value: 'I am terminating...' });
console.log('task has started.');
//process.addListener('wait', () => { });
//# sourceMappingURL=httptest.js.map