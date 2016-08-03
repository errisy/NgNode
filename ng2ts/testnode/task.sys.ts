import * as http from 'http';
import {jQuery, JQuery} from 'jquery';
//process.addListener('message', (ev: string) => {
//    console.log('message: ', ev);
//});
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
process.once('message', (ev: ISearchTask) => {

    HTTPClient.requestText({
        host: 'eutils.ncbi.nlm.nih.gov',
        path: '/entrez/eutils/esearch.fcgi?db=pubmed&retmax=100&term=' + ev.keywords.split(' ').join('+')
    }, analyze);

    function analyze(stream: any) {
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

    function parseItem(value: string) {
        let results = XMLParse.find(value, 'PubmedArticle').map(article => {
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


