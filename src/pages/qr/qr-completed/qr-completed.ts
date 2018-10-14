import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

@IonicPage({
    name: 'qr-completed'
})
@Component({
    selector: 'page-qr-completed',
    templateUrl: 'qr-completed.html',
})
export class QrCompletedPage {
    order = {};
    meal = {};
    foodEntrepreneur = {};
    user = {};

    constructor(private navCtrl: NavController,
                private navParams: NavParams) {
        this.order = navParams.get('order');
        this.meal = navParams.get('meal');
        this.foodEntrepreneur = navParams.get('foodEntrepreneur');
        this.user = navParams.get('user');
    }

    openPage(segment) {
        try {
            this.navCtrl.setRoot(segment);
        } catch (err) {
            console.log(err);
            this.navCtrl.setRoot('orders');
        }
    }

}
