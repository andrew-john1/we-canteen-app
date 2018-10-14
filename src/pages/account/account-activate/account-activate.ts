import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';

@IonicPage({
    name: 'account-activate',
    segment: 'account-activate/:hash'
})
@Component({
    selector: 'page-account-activate',
    templateUrl: 'account-activate.html',
})
export class AccountActivatePage {
    hash;

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private navParams: NavParams) {
        this.hash = navParams.get('hash');
    }

    async ionViewDidLoad() {
        try {
            await this.http.postWithoutToken('/guest/accountHash', {hash: this.hash});
        } catch (err) {
            console.log(err);
        }
    }

    login() {
        this.navCtrl.setRoot('login');
    }

}
