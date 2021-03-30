declare type State = {
    store: any;
};
declare type Action = {
    type: string;
    data: any;
    id?: string;
};
export declare function clientReducer(state: State, action: Action): State;
export {};
