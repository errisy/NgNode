"use strict";
var http = require('http');
var mongodb_1 = require('mongodb');
var assert = require('assert');
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
var ev = {
    keywords: 'science[journal] AND breast cancer AND 2008'
};
console.log('message from master: ', ev.keywords);
var options = {
    //protocol: 'http:',
    host: 'eutils.ncbi.nlm.nih.gov',
    //port: 80,
    path: '/entrez/eutils/esearch.fcgi?db=pubmed&retmax=100&term=' + ev.keywords.split(' ').join('+')
};
console.log(options.host + options.path);
HTTPClient.requestText(options, analyze);
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
            _id: XMLParse.find(article, 'PMID')[0],
            title: XMLParse.find(article, 'ArticleTitle')[0].replace(/[\n\r]*/ig, ''),
            abstract: XMLParse.find(article, 'AbstractText')[0] ? XMLParse.find(article, 'AbstractText')[0].replace(/[\n\r]*/ig, '') : ''
        };
    });
    //console.log(results);
    mongodb_1.MongoClient.connect('mongodb://localhost:27017/ncbi', function (err, db) {
        if (err)
            console.log(err);
        var documents = db.collection('documents');
        function step1() {
            console.log('step1');
            try {
                documents.insertMany(results, function (err, result) {
                    if (err) {
                    }
                    else {
                        assert.equal(err, null);
                        assert.equal(results.length, result.ops.length);
                        assert.equal(1, result.result.ok);
                    }
                    if (result.ops) {
                        console.log(result.ops.length + ' items inserted.');
                    }
                    else {
                        console.log('0 items inserted.');
                    }
                    step2();
                });
            }
            catch (err) {
                console.log('insert many error: ', err);
            }
        }
        function step2() {
            console.log('step2');
            documents.count({}).then(function (onfulfilled) {
                console.log('onfulfilled', onfulfilled);
                step3();
            }, function (onrejected) {
                step3();
            });
        }
        function step3() {
            //console.log('step3');
            //documents.remove({});
            step4();
        }
        function step4() {
            documents.find({}).toArray(function (err, items) {
                items.forEach(function (item) {
                    console.log(item._id);
                });
            });
            console.log('step4');
            db.close();
        }
        //documents.find({}).toArray((err, docs) => {
        //    docs.forEach((value: { id: string, abstract: string }) => {
        //        console.log(value.id);
        //    });
        //});
        step1();
    });
}
console.log('task has started.');
//process.addListener('wait', () => { });
//# sourceMappingURL=httptest.js.map