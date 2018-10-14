import {Component, ViewChild} from '@angular/core';
import {Events, IonicPage, Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {TranslateService} from '@ngx-translate/core';
import {HttpProvider} from '../providers/http/http';
import {AuthProvider} from '../providers/auth/auth';
import {Deeplinks} from '@ionic-native/deeplinks';
import {LocalNotifications} from '@ionic-native/local-notifications';

@Component({
    templateUrl: 'app.html'
})
export class WeCanteenApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any;
    isLoggedIn = false;
    isAdmin = false;

    constructor(private platform: Platform,
                private statusBar: StatusBar,
                private http: HttpProvider,
                private auth: AuthProvider,
                private events: Events,
                private deeplinks: Deeplinks,
                private translateService: TranslateService,
                private splashScreen: SplashScreen,
                private localNotifications: LocalNotifications) {
        events.subscribe('user:language', language => {
            translateService.use(language);
        });

        try {
            this.translateConfig();
            this.initializeApp();
        } catch (err) {
            console.log(err)
        }
    }

    async initializeApp() {
        const onBoarding = localStorage.getItem('onBoarding');
        const userRightsString = localStorage.getItem('userRights') || '1';

        if (onBoarding === 'true') {
            try {
                await this.http.validateToken();
                const userRights = JSON.parse(userRightsString);

                if (userRights > 2) {
                    this.isAdmin = true;
                }

                this.rootPage = 'meals';
                this.isLoggedIn = true;
            } catch (err) {
                console.log(err);
                this.rootPage = 'login';
            }
        } else {
            this.rootPage = 'onboarding';
        }

        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.

            if (this.platform.is('cordova')) {
                // let status bar overlay webview
                this.statusBar.overlaysWebView(false);

                // set status bar to white
                this.statusBar.backgroundColorByHexString('#8BB8B8');
                this.splashScreen.hide();

                this.deeplinks.routeWithNavController(this.nav, {
                    '/account': 'account-activate',
                    '/password': 'password-reset'
                }).subscribe(match => {
                    // match.$route - the route we matched, which is the matched entry from the arguments to route()
                    // match.$args - the args passed in the link
                    // match.$link - the full link data
                    console.log('Successfully matched route', match);
                }, (nomatch) => {
                    // nomatch.$link - the full link data
                    console.error('Got a deeplink that didn\'t match', nomatch);
                });

                // this.localNotifications.schedule({
                //     id: 1,
                //     title: 'Romige broccolisoep met zalm - DASlekker',
                //     text: '8 november 2017 • 16:00 - 22:00'
                // });
            }
        });
    }

    translateConfig() {
        let userLang = localStorage.getItem('language');

        if (!userLang) {
            userLang = this.translateService.getBrowserLang();
            userLang = (userLang === 'nl') ? 'nl' : 'en';
            localStorage.setItem('language', userLang);
        }

        this.translateService.setDefaultLang('nl');
        this.translateService.use('nl');
    }

    openPage(page) {
        this.nav.setRoot(page);
    }

    async logout() {
        await this.nav.setRoot('login');
        this.isLoggedIn = false;
        const accessToken = localStorage.getItem('accessToken');
        await this.http.post('/user/removeToken', {accessToken});
        this.auth.logout();
    }
}
