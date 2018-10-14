import {Component} from '@angular/core';
import {IonicPage, NavParams, ViewController, LoadingController, NavController, App} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import * as moment from 'moment';

@IonicPage({
    name: 'qr-result',
    segment: 'qr-result'
})
@Component({
    selector: 'page-qr-result',
    templateUrl: 'qr-result.html'
})
export class QrResultPage {
    orderId;
    order;
    meal;
    foodEntrepreneur;
    user;
    location;

    constructor(private http: HttpProvider,
                private app: App,
                private navCtrl: NavController,
                private viewCtrl: ViewController,
                private loadingCtrl: LoadingController,
                private navParams: NavParams) {
        this.orderId = navParams.get('orderId');
    }

    async ionViewDidLoad() {
        this.order = await this.http.get(`/order/${this.orderId}`);

        const {
            date,
            mealId,
            foodEntrepreneurId,
            userId,
            locationId
        } = this.order;

        this.order.formattedDate = moment(date).format('ll');

        try {
            const [
                meal,
                foodEntrepreneur,
                user,
                location
            ] = await Promise.all([
                this.http.get(`/meal/${mealId}`),
                this.http.get(`/foodEntrepreneur/${foodEntrepreneurId}`),
                this.http.get(`/user/${userId}`),
                this.http.get(`/location/${locationId}`)
            ]);

            this.meal = meal;
            this.foodEntrepreneur = foodEntrepreneur;
            this.user = user;
            this.location = location;
        } catch (err) {
            console.log(err);
        }
    }

    async giveAwayMeal(order) {
        const loading = this.loadingCtrl.create();
        loading.present();

        try {
            await this.http.postWithToken('/order/giveAway', {order});

            loading.dismiss();

            await this.viewCtrl.dismiss();

            this.app.getActiveNavs()[0].setRoot('qr-completed', {
                order: this.order,
                meal: this.meal,
                foodEntrepreneur: this.foodEntrepreneur,
                user: this.user
            });

        } catch (err) {
            console.log(err);
            loading.dismiss();
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
