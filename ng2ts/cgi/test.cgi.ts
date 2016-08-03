import * as fs from 'fs';
import * as http from 'http';

import {Cat} from './cat';

module insider {

    let res: http.ServerResponse = require('[response]');
    let c = new Cat();
    c.name = 'tom';

    let value = fs.readFileSync(__dirname + '/cat.ts').toString();

    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end(JSON.stringify(c) + '\n' + value);

}