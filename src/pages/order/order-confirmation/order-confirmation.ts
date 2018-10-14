import {Component} from '@angular/core';
import {App, IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import * as moment from 'moment';

@IonicPage({
    name: 'order-confirmation'
})
@Component({
    selector: 'page-order-confirmation',
    templateUrl: 'order-confirmation.html',
})
export class OrderConfirmationPage {
    user = {};
    orders;

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private viewCtrl: ViewController,
                private app: App,
                private navParams: NavParams) {
        this.orders = navParams.get('orders');
        console.log(this.orders);
    }

    async ionViewDidLoad() {
        this.orders.forEach(order => {
            order.formattedDate = moment(order.date).format('LL');
        });

        try {
            const userId = localStorage.getItem('userId');
            this.user = await this.http.get(`/user/${userId}`);
        } catch (err) {
            console.log(err);
        }
    }

    async openPage(segment) {
        try {
            await this.viewCtrl.dismiss();
            this.app.getActiveNavs()[0].setRoot(segment);
        } catch (err) {
            console.log(err);
        }
    }

}
