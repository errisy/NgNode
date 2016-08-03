import { Http, Response } from '@angular/http';

export function RPC(url?: string, method?: 'POST' | 'GET') {
    //by default, this uses the parentGateway's URL;
    return (target: Object, properyKey: string, descriptor: PropertyDescriptor) => {
        let originalMethod: Function = descriptor.value;
        //target is the host Object
        descriptor.value = (...args: any[]) => {
            //this will just call the remove service to 
            let result = originalMethod.apply(args);
            return result;
        }
        return descriptor;
    }
}
export function RPC2<T extends Function>(url?: string, method?: 'POST' | 'GET') {
    //by default, this uses the parentGateway's URL;
    return (target: Object, properyKey: string, descriptor: TypePropertyDescriptor<T>) => {
        let originalMethod: Function = descriptor.value;
        //target is the host Object
        descriptor.value = <any>((...args: any[]) => {
            //this will just call the remove service to 
            let result = originalMethod.apply(args);
            return result;
        });
        return descriptor;
    }
}

class U {
    @RPC2<(m:number)=>void>()
    user(m:number) {
    }
}

interface TypePropertyDescriptor<T extends Function> {
    configurable?: boolean;
    enumerable?: boolean;
    value?: T;
    writable?: boolean;
    get?(): any;
    set?(v: any): void;
}

export function RPCGateway(url: string, method?: 'POST'|'GET') {
    return (target: any) => {
        // save a reference to the original constructor
        var original: Function = target;
        // a utility function to generate instances of a class
        function construct(constructor: Function, args:any[]) {
            var c: any = function () {
                return constructor.apply(this, args);
            }
            c.prototype = constructor.prototype;
            let instance = new c();
            instance['$rpcURL'] = url;
            return instance;
        }

        // the new constructor behaviour
        var f: any = function (...args:any[]) {
            console.log("New: " + original.name);
            return construct(original, args);
        }
        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        // return new constructor (will override original)
        return f;
    }
}
