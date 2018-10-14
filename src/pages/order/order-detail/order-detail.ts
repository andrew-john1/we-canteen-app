import {Component} from '@angular/core';
import {IonicPage, NavParams, ViewController} from 'ionic-angular';

@IonicPage({
    name: 'order-detail',
    segment: 'order/:id'
})
@Component({
    selector: 'page-order-detail',
    templateUrl: 'order-detail.html',
})
export class OrderDetailPage {
    order;

    constructor(private viewCtrl: ViewController,
                private navParams: NavParams) {
        this.order = navParams.get('order');
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
