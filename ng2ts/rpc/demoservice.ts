import {Dog} from "../app/dog.ts";

export class Demo {
    public Dogs(): Dog[] {
        let list: Dog[] = [];
        {
            let d = new Dog();
            d.Name = 'labrador';
            list.push(d);
        }
        {
            let d = new Dog();
            d.Name = 'golden retriever';
            list.push(d);
        }
        return list;
    }
    public test(): string {
        return 'hello';
    }
}