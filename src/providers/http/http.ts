import {Injectable} from '@angular/core';
import {Http, URLSearchParams, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Config} from '../../config';
import 'rxjs/add/operator/toPromise';
import * as moment from 'moment';

import {AuthProvider} from '../auth/auth';

@Injectable()
export class HttpProvider {

    url = Config.url;
    clientId = Config.clientId;
    secret = Config.secret;
    basicAuth = `Basic ${btoa(`${this.clientId}:${this.secret}`)}`;

    refreshPromise = null;

    constructor(private http: Http,
                private auth: AuthProvider) {
    }

    async getWithoutToken(url): Promise<any> {
        const res = await this.http.get(this.url + url).toPromise();
        return res.json() || {};
    }

    async postWithoutToken(url, data): Promise<any> {
        const res = await this.http.post(this.url + url, data).toPromise();
        return res.json() || {};
    }

    async login({email, password}): Promise<any> {
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': this.basicAuth
        });

        const urlSearchParams = new URLSearchParams();
        urlSearchParams.append('grant_type', 'password');
        urlSearchParams.append('username', email);
        urlSearchParams.append('password', password);

        const body = urlSearchParams.toString();

        try {
            const res = await this.http.post(this.url + '/oauth/token', body, {headers}).toPromise();
            return res.json() || {};
        } catch (err) {
            console.log(err);
        }
    }

    async validateToken(): Promise<any> {
        const accessTokenExpiresAt = localStorage.getItem('accessTokenExpiresAt');
        const refreshTokenExpiresAt = localStorage.getItem('refreshTokenExpiresAt');

        if (moment() < moment(accessTokenExpiresAt)) {
            return localStorage.getItem('accessToken');
        } else if (moment() < moment(refreshTokenExpiresAt)) {
            const refreshToken = localStorage.getItem('refreshToken');

            if (this.refreshPromise === null) {
                this.refreshPromise = this.refreshToken(refreshToken);
            }

            return await this.refreshPromise;
        } else {
            throw {message: 'Token invalid'};
        }
    }

    async refreshToken(token): Promise<any> {
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': this.basicAuth
        });

        const urlSearchParams = new URLSearchParams();
        urlSearchParams.append('grant_type', 'refresh_token');
        urlSearchParams.append('refresh_token', token);

        const body = urlSearchParams.toString();

        try {
            const res = await this.http.post(this.url + '/oauth/token', body, {headers}).toPromise();
            const token = res.json() || {};
            this.refreshPromise = null;
            this.auth.setToken(token);
            return token.access_token;
        } catch (err) {
            console.log(err);
        }
    }

    async get(url): Promise<any> {
        try {
            const token = await this.validateToken();
            const headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            const res = await this.http.get(this.url + url, {headers}).toPromise();
            return res.json() || {};
        } catch (err) {
            console.log(err);
        }
    }

    async post(url, data) {
        try {
            const token = await this.validateToken();
            const headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            const res = await this.http.post(this.url + url, data, {headers}).toPromise();
            return res.json() || {};
        } catch (err) {
            console.log(err);
        }
    }

    async postWithToken(url, data): Promise<any> {
        try {
            const token = await this.validateToken();
            const headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            data.order.token = token;

            const res = await this.http.post(this.url + url, data, {headers}).toPromise();
            return res.json() || {};
        } catch (err) {
            console.log(err);
        }
    }

    patch() {

    }

    async delete(url): Promise<any> {
        try {
            const token = await this.validateToken();
            const headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            const res = await this.http.delete(this.url + url, {headers}).toPromise();
            return res.json() || {};
        } catch (err) {
            console.log(err);
        }
    }

}
