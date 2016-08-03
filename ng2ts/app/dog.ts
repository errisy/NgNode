import {Serializable} from 'Serializable';
@Serializable('/app/dog')
export class Dog {
    public Name: string;
    public Test: string = "test property";
}