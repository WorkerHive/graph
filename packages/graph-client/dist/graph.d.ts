import { WorkhubClient } from '.';
export declare class Graph {
    private graphClient;
    private client;
    private hubUrl?;
    constructor(client: WorkhubClient);
    static from(client: WorkhubClient): Promise<Graph>;
    setup(): void;
    query(query: string, variables?: object): Promise<any>;
    mutation(query: string, variables?: object): Promise<any>;
}
