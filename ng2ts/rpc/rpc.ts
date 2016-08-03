import {Response } from '@angular/http';
import {Deserialize} from './serialization';

/**
 * Register a member in a rpcService to work as cgi method;
 * @param target
 * @param propertyKey
 */
export function rpcMember(
    target: Object, // The prototype of the class
    propertyKey: string//,  The name of the method
    //descriptor: TypedPropertyDescriptor<any>
): void {
    console.log("MethodDecorator called on: ", target, propertyKey);
    //return descriptor;
}
/**
 * Register a class as rpcService so it will be converted to .service.ts and .cgi.ts by rpc service compiler;
 * the .cgi.ts will wrap the service to process http requests;
 * @param target
 */
export function rpcService(target: Object) {
    //doing nothing here;
}

export class Converter {
    /**
     * Convert string to string;
     * @param res
     */
    static convertStringResponse(res: Response):string {
        return res.text();
    }
    /**
     * Convert response to json and deserialize it;
     * @param res
     */
    static convertJsonResponse(res: Response): any{
        return Deserialize(res.json());
    }
    /**
     * Convert response from text to number value;
     * @param res
     */
    static convertNumberResponse(res: Response): number {
        return Number(res.text());
    }
    /**
     * Convert response from text to boolean value;
     * @param res
     */
    static convertBooleanResponse(res: Response): boolean {
        return Boolean(res.text());
    }
}

