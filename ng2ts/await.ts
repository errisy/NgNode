
import * as http from 'http';

console.log('start');

function httpRequest(options: http.RequestOptions): (callback: (value: string) => void)=>void {
    return (callback: (value: string) => void) => {
        let client = http.request(options, res => {
            let chunk: string = '';
            res.on('data', (value: string) => {
                chunk += value;
            });
            res.on('end', (value: string) => {
                chunk += value;
                callback(chunk);
            });
        });
        client.end();
    }
}
 
interface IAsync {
    (): void;
}

class async {
    public statements: IAsync[] = [] ;
    public run(statement: () => void) {
        this.statements.push(
            () => {
                statement();
                this.next();
            }
        );
        if (this.canRun) this.next();
    }
    public await<T>(statement: (callback: (value: T) => void) => void, setter: (value: T) => void) {
        this.statements.push(
            () => {
                statement((value: T) => {
                    setter(value);
                    this.next();
                });
            }
        );
        if (this.canRun) this.next();
    }
    public canRun: boolean = true;
    public next() {
        if (this.statements.length > 0) {
            let ia = this.statements.shift();
            this.canRun = false;
            ia();
        }
        else {
            this.canRun = true;
        }
    }
}

function test() {
    let a = new async();
    let html: string;
    a.run(() => console.log('first step'));
    a.await(httpRequest({ host: 'm.newsmth.net' }), value => html = value);
    a.run(() => console.log('res: ', html.substr(0, 40)));
    a.await(httpRequest({ host: 'localhost' }), value => html = value);
    a.run(() => console.log('res: ', html.substr(0, 80)));
    a.run(() => {
        console.log('res method: ');
    });

}

console.log('before test');
test();