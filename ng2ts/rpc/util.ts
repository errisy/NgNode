import * as http from 'http';


export function Receive(request: http.ServerRequest, callback: (data:any) => void) {
    let body = "";
    request.on('data', function (chunk: string) {
        body += chunk;
    });
    request.on('end', function () {
        if (callback) callback(JSON.parse(body));
    })
}

export function UrlParse(request: http.ServerRequest): { Class: string, Member: string } {
    let matches = /\?(\w+)#(\w+)$/.exec(request.url);
    return {
        Class: matches[1], Member: matches[2]
    };
}