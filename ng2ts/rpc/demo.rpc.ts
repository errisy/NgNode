import {Dog} from "../app/dog";
import {rpcService, rpcMember} from 'Serializable';

@rpcService
export class Demo {
    @rpcMember
    public Dogs(): Dog[] {
        let list: Dog[] = [];
        {
            let c: number = 20;
            let d = new Dog(); 
            d.Name = 'labrador';
            list.push(d);
        }
        {
            let d = new Dog();
            d.Name = 'golden retriever';
            list.push(d);
            let c = '2243344';
        }
        return list;
    }
    @rpcMember
    public test(jack:string, sam: number, jason: Dog): string {
        return 'hello';
    }
    @rpcMember
    public tom(): Dog {
        return new Dog();
    }
    @rpcMember
    public jerry(): boolean {
        return false; 
    }
    @rpcMember
    public get Joke(): string {
        return 'tester';//no 
    }
    public set Joke(value: string) {
        console.log(value);
    }
}

// there shall be a function in vm that wraps this script and return new Demo() to serve the incoming request;
//return new Demo();