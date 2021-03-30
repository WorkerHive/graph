export declare class Postman {
    private axiosInst;
    constructor(url: string);
    updateBaseURL(url?: string): void;
    get(slug: string, headers: any): Promise<import("axios").AxiosResponse<any>>;
    post(slug: string, body: any, headers: any): Promise<import("axios").AxiosResponse<any>>;
}
