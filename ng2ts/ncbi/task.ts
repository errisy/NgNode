import {Serializable} from 'Serializable';

@Serializable('/ncbi/task')
export class TaskInfo {
    public id: string;
    public filename: string;
    public status: 'Scheduled' | 'Running' | 'Error' | 'Completed';
    public progress: string;
    /**start time in milliseconds from 1970-1-1 00:00:00*/
    public starttime: number;
    /**start time in milliseconds from 1970-1-1 00:00:00*/
    public endtime: number;
    public args: string[];
    public obj: any;
}