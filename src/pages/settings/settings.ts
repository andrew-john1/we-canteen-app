import {Component} from '@angular/core';
import {Events, IonicPage} from 'ionic-angular';

@IonicPage({
    name: 'settings'
})
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage {

    language;
    paymentMethod;

    constructor(private events: Events) {
    }

    ionViewDidLoad() {
        this.language = localStorage.getItem('language');

        const paymentMethod = localStorage.getItem('paymentMethod');
        if (paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }

    selectLanguage(language) {
        localStorage.setItem('language', language);
        this.events.publish('user:language', language);
    }

    selectPaymentMethod(method) {
        localStorage.setItem('paymentMethod', method);
    }

    selectEmailSetting(value) {
        console.log(value);
    }

}
