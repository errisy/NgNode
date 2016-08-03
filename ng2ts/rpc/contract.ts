import {Serializable} from './serialization';

@Serializable('./rpc/contract')
export class RPCPackage {
    public Name: string;
    public Arguments: any[] = [];
}
@Serializable('./rpc/contract')
export class RPCReturn {
    public Value: any;
    public Error: string;
}