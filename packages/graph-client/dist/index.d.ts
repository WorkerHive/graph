declare global {
    interface Window {
        workhubFS: WorkhubFS;
    }
}
import { WorkhubFS } from '@workerhive/ipfs';
import { useRealtime, RealtimeSync } from './yjs';
import { WorkhubProvider, useHub } from './react';
import { ActionFactory } from './actions';
import { ModelStorage } from './models';
import { Auth } from './auth';
export interface UserInfo {
    username?: string;
    password?: string;
    confirm_password?: string;
    name?: string;
    email?: string;
    phone_number?: string;
}
export { WorkhubProvider, useHub, RealtimeSync, useRealtime };
export declare class WorkhubClient {
    lastUpdate: Date | null;
    hubUrl?: string;
    private hostURL?;
    private hostName?;
    private client?;
    uploadModels?: Array<any>;
    private platform;
    realtimeSync?: RealtimeSync;
    fsLayer?: WorkhubFS;
    accessToken?: string;
    private swarmKey?;
    models?: ModelStorage;
    private postman;
    actionFactory?: ActionFactory;
    auth: Auth;
    query: (query: string, variables?: object) => any;
    mutation: (query: string, variables?: object) => any;
    constructor(url?: string, setup_fn?: Function, dispatch?: any);
    updateBaseURL(url?: string): void;
    get user(): any;
    crudAccess(type: string): string[];
    canAccess(type: string, action: string): boolean;
    setAccessToken(token: string): void;
    actions(func_name: string): any;
    initIPFS(swarmKey: string): Promise<void>;
    setupGraph(): Promise<void>;
    setup(dispatch: any): Promise<void>;
    getSwarmKey(): Promise<any>;
    setupBasicReads(dispatch: any): void;
}
