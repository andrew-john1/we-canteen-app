import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {WeCanteenApp} from './app.component';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HttpProvider} from '../providers/http/http';
import {HttpModule} from '@angular/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AuthProvider} from '../providers/auth/auth';
import {ShoppingCartPageModule} from '../pages/shopping-cart/shopping-cart.module';
import {SharedProvider} from '../providers/shared/shared';
import {Deeplinks} from "@ionic-native/deeplinks";
import {QRScanner} from '@ionic-native/qr-scanner';
import {LocalNotifications} from '@ionic-native/local-notifications';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        WeCanteenApp
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        HttpModule,
        ShoppingCartPageModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        IonicModule.forRoot(WeCanteenApp, {
            menuType: 'push',
            backButtonText: '',
            pageTransition: 'md-transition',
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        WeCanteenApp
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Deeplinks,
        QRScanner,
        LocalNotifications,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        AuthProvider,
        HttpProvider,
        SharedProvider,
    ]
})
export class AppModule {
}
