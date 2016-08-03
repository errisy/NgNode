import {rpcService, rpcMember, ITaskHost, TaskInfo} from 'Serializable';
import {Dog} from '../app/dog';

interface ISearchTask {
    keywords: string;
    limit: number;
}

@rpcService
export class NCBIMethods {
    @rpcMember
    public test():string {
        return 'let\'s encrypt!';
    }
    @rpcMember
    public dogs(): Dog[] {
        let results: Dog[] = [];
        {
            let d = new Dog();
            d.Name = 'labrador';
            results.push(d);
        }
        return results;
    }
    @rpcMember
    public log(dog: Dog) {
        console.log(dog);
        this.search('science[journal] AND breast cancer AND 2008', 30);
    }
    @rpcMember
    public search(keywords: string, limit: number): TaskInfo {
        let tasks: ITaskHost = require('[tasks]');
        let obj: ISearchTask = { keywords: keywords, limit: limit };
        let key = tasks.createTask('testnode\\task', [], obj);
        let time = Number(Date.now());
        let task = new TaskInfo();
        task.id = key;
        task.starttime = time;
        return task;
    }
}