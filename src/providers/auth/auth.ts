import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthProvider {

    constructor() {
    }

    setToken({
                 token: {
                     accessToken,
                     accessTokenExpiresAt,
                     refreshToken,
                     refreshTokenExpiresAt
                 },
                 userRights,
                 userId,
                 instanceId
             }) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('accessTokenExpiresAt', accessTokenExpiresAt);
        localStorage.setItem('refreshTokenExpiresAt', refreshTokenExpiresAt);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userRights', userRights);
        localStorage.setItem('instanceId', instanceId);
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessTokenExpiresAt');
        localStorage.removeItem('refreshTokenExpiresAt');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRights');
        localStorage.removeItem('instanceId');
        localStorage.removeItem('shoppingCart');
        localStorage.removeItem('locationId');
        localStorage.removeItem('paymentMethod');
    }
}
