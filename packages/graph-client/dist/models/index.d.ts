import { WorkhubClient } from "..";
export declare class ModelStorage {
    private client;
    lastUpdate?: Date;
    types?: {
        crud?: any;
        upload?: any;
        configurable?: any;
    };
    constructor(client: WorkhubClient);
    getByName(name: string): any;
    getByDirective(directive: string): any;
    getTypes(): Promise<{
        crud?: any;
        upload?: any;
        configurable?: any;
    }>;
    map(func: any): any;
}
