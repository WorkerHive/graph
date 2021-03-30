/// <reference types="react" />
import { WorkhubClient } from '.';
declare global {
    interface Window {
        hubClient?: WorkhubClient;
    }
}
export declare const WorkhubProvider: ({ children, token, url }: ProviderProps) => JSX.Element;
export declare const useHubHook: (url: string, token: string) => [WorkhubClient | undefined, any, Boolean, Error | null];
export interface ProviderProps {
    children: any;
    token?: string;
    url: string;
}
export declare const useHub: () => [WorkhubClient | undefined, any, Boolean, Error | null];
