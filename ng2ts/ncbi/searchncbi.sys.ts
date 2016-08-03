import * as http from 'http';
import {MongoClient} from 'mongodb';
import * as assert from 'assert';

interface ISearchTask {
    keywords: string;
    limit: number;
}

module XMLParse {
    export function find(input: string, type: string): string[] {
        let results: string[] = [];
        let patternBegin = new RegExp('<' + type + '(>| [^>]*>)', 'ig');
        let patternEnd = new RegExp('<\/' + type + '>', 'ig');
        let result: string[];
        while (patternBegin.test(input)) {
            let begin = patternBegin.lastIndex;
            patternEnd.lastIndex = patternBegin.lastIndex;
            if (result = patternEnd.exec(input)) {
                results.push(input.substring(begin, patternEnd.lastIndex - result[0].length));
            }
        }
        return results;
    }
}

module HTTPClient {
    export function requestText(options: http.RequestOptions, endCallback: (value: string) => void) {
        let client = http.request(options, (res) => {
            let stream: string = '';
            res.on('data', (value: any) => {
                //console.log('data receiving: ', value);
                stream += value;
            });
            res.on('end', (value: any) => {
                stream += value;
                endCallback(stream);
            });
        });
        client.end();
    }
}

interface ISearch {
    keywords: string;
    limit: number;
}

function analyze(stream: any) {

    process.send('analyzing ID from response');
    let ids = XMLParse.find(stream, 'Id');

    let fetchOptions: http.RequestOptions = {
        host: 'eutils.ncbi.nlm.nih.gov',
        path: '/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=' + ids.join(',')
    };

    HTTPClient.requestText({
        host: 'eutils.ncbi.nlm.nih.gov',
        path: '/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=' + ids.join(',')
    }, parseItem);


}

interface INCBIEntry {
    _id: string;
    title: string;
    abstract: string;
}

function parseItem(value: string) {
    let results = XMLParse.find(value, 'PubmedArticle').map(article => {
        //console.log(article);
        return {
            _id: XMLParse.find(article, 'PMID')[0],
            title: XMLParse.find(article, 'ArticleTitle')[0].replace(/[\n\r]*/ig, ''),
            abstract: XMLParse.find(article, 'AbstractText')[0] ? XMLParse.find(article, 'AbstractText')[0].replace(/[\n\r]*/ig, '') : ''
        };
    });
    //console.log(results);
    MongoClient.connect('mongodb://localhost:27017/ncbi', (err, db) => {
        if (err) console.log(err);
        let documents = db.collection('documents');

        function step1() {
            console.log('step1');
            try {
                documents.insertMany(results, (err, result) => {
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
                });
            }
            catch (err) {
                console.log('Error @ insert many : ', err);
            }
        }
        step1();
    });
}

process.once('message', (ev: ISearch) => {
    console.log('message from master: ', ev.keywords);
    let options: http.RequestOptions = {
        //protocol: 'http:',
        host: 'eutils.ncbi.nlm.nih.gov',
        //port: 80,
        path: '/entrez/eutils/esearch.fcgi?db=pubmed&retmax=100&term=' + ev.keywords.split(' ').join('+')
    };
    process.send('remote search started.');
    HTTPClient.requestText(options, analyze);
});

console.log('task has started.');


