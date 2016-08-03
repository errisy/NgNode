"use strict";
var http = require('http');
var XMLParse;
(function (XMLParse) {
    function find(input, type) {
        var results = [];
        var patternBegin = new RegExp('<' + type + '(>| [^>]*>)', 'ig');
        var patternEnd = new RegExp('<\/' + type + '>', 'ig');
        var result;
        while (patternBegin.test(input)) {
            var begin = patternBegin.lastIndex;
            patternEnd.lastIndex = patternBegin.lastIndex;
            if (result = patternEnd.exec(input)) {
                results.push(input.substring(begin, patternEnd.lastIndex - result[0].length));
            }
        }
        return results;
    }
    XMLParse.find = find;
})(XMLParse || (XMLParse = {}));
var HTTPClient;
(function (HTTPClient) {
    function requestText(options, endCallback) {
        var client = http.request(options, function (res) {
            var stream = '';
            res.on('data', function (value) {
                //console.log('data receiving: ', value);
                stream += value;
            });
            res.on('end', function (value) {
                stream += value;
                endCallback(stream);
            });
        });
        client.end();
    }
    HTTPClient.requestText = requestText;
})(HTTPClient || (HTTPClient = {}));
process.once('message', function (ev) {
    HTTPClient.requestText({
        host: 'eutils.ncbi.nlm.nih.gov',
        path: '/entrez/eutils/esearch.fcgi?db=pubmed&retmax=100&term=' + ev.keywords.split(' ').join('+')
    }, analyze);
    function analyze(stream) {
        var ids = XMLParse.find(stream, 'Id');
        var fetchOptions = {
            host: 'eutils.ncbi.nlm.nih.gov',
            path: '/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=' + ids.join(',')
        };
        HTTPClient.requestText({
            host: 'eutils.ncbi.nlm.nih.gov',
            path: '/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=' + ids.join(',')
        }, parseItem);
    }
    function parseItem(value) {
        var results = XMLParse.find(value, 'PubmedArticle').map(function (article) {
            //console.log(article);
            return {
                id: XMLParse.find(article, 'PMID')[0],
                title: XMLParse.find(article, 'ArticleTitle')[0].replace(/[\n\r]*/ig, ''),
                abstract: XMLParse.find(article, 'AbstractText')[0] ? XMLParse.find(article, 'AbstractText')[0].replace(/[\n\r]*/ig, '') : ''
            };
        });
        console.log(results);
    }
});
console.log('task has started.');
//process.addListener('wait', () => { });
//# sourceMappingURL=task.sys.js.map