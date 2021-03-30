import { WorkhubClient } from "..";
import { ModelStorage } from "../models";
export declare class ActionFactory {
    private client;
    private models;
    private lastUpdate?;
    private actions;
    constructor(client: WorkhubClient, models: ModelStorage, dispatch: any);
    getFunction(func: string): any;
}
