import * as Y from 'yjs';
import 'websocket-polyfill';
import { YMap } from 'yjs/dist/src/internals';
export declare function useRealtime(syncObject: Y.Array<any> | Y.Map<any>, reducer: (state: any, action: any) => any): any[];
export declare class RealtimeSync {
    doc: Y.Doc;
    private websocketProvider;
    private persistence;
    status: string;
    constructor(url: string);
    pushArray(arrKey: string, items: any[]): void;
    getArray(key: string, model: any): RealtimeArray;
    getMap(key: string): RealtimeMap;
}
export declare class RealtimeArray {
    private array;
    private model;
    constructor(yArray: Y.Array<any>, model: any);
    push(content: any[]): void;
    toArray(): any[];
}
export declare class RealtimeMap {
    private map;
    constructor(yMap: YMap<any>);
    set(key: string, value: any): void;
    get(key: string): void;
    toJSON(): any;
}
