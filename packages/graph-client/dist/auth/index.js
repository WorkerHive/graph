"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
class Auth {
    constructor(client, postman) {
        this.client = client;
        this.postman = postman;
    }
    async authenticate(username, password) {
        //Write to reducer
        let resp = await this.postman.post('/login', {
            strategy: 'jwt',
            username: username,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (resp.data.token) {
            this.client.setAccessToken(resp.data.token);
            localStorage.setItem('token', resp.data.token);
            return true;
        }
        else {
            return { error: resp.data.error };
        }
    }
    async forgotPassword(email) {
        let data = await this.postman.post('/forgot', {
            email
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return data.data;
    }
    async resetPassword(password, token) {
        let data = await this.postman.post('/reset', {
            password
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        return data.data;
    }
    async setupHub(hubUrl, hubName) {
        this.client.updateBaseURL(hubUrl);
        let data = await this.postman.post('/provision', {
            device: "TeamHub",
            hubName: hubName
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return data.data;
    }
    async signupInfo(token) {
        let resp = await this.postman.get(`/signup`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return resp.data;
    }
    async trySignup(signup_info, token) {
        let resp = await this.postman.post(`/signup`, Object.assign({}, signup_info), {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        });
        return resp.data;
    }
}
exports.Auth = Auth;
//# sourceMappingURL=index.js.map