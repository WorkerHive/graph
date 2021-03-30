import { WorkhubClient } from "..";
import { Postman } from "../postman";
export declare class Auth {
    private client;
    private postman;
    constructor(client: WorkhubClient, postman: Postman);
    authenticate(username: string, password: string): Promise<true | {
        error: any;
    }>;
    forgotPassword(email: string): Promise<any>;
    resetPassword(password: string, token: string): Promise<any>;
    setupHub(hubUrl: string, hubName: string): Promise<any>;
    signupInfo(token: string): Promise<any>;
    trySignup(signup_info: {}, token: string): Promise<any>;
}
