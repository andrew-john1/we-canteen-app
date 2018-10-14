import {Component, ViewChild} from '@angular/core';
import {AlertController, Events, IonicPage, LoadingController, ModalController, Select, ViewController} from 'ionic-angular';
import {HttpProvider} from '../../providers/http/http';
import * as moment from 'moment';
import {SharedProvider} from '../../providers/shared/shared';
import {TranslateService} from '@ngx-translate/core';

const language = localStorage.getItem('language');
moment.locale(language);

@IonicPage({
    name: 'shopping-cart'
})
@Component({
    selector: 'page-shopping-cart',
    templateUrl: 'shopping-cart.html',
})
export class ShoppingCartPage {
    @ViewChild(Select) select: Select;

    eventsByDate: any = {};
    dates = [];
    subtotal: any = 0;
    totalAmount: number = 0;

    constructor(private viewCtrl: ViewController,
                private alertCtrl: AlertController,
                private http: HttpProvider,
                private events: Events,
                private translateService: TranslateService,
                private modalCtrl: ModalController,
                private loadingCtrl: LoadingController,
                private sharedProvider: SharedProvider) {
    }

    async ionViewDidLoad() {
        try {
            const instanceId = localStorage.getItem('instanceId');
            const instance = await this.http.get(`/instance/${instanceId}`);

            const events = JSON.parse(localStorage.getItem('shoppingCart')) || [];

            events.forEach((event, index) => {
                console.log(event);
                if (moment(event.date) < moment().endOf('day')) {
                    events.splice(index, 1);
                } else {
                    let date = moment(event.date).format('YYYY-MM-DD');
                    if (!this.eventsByDate[date]) {
                        this.dates.push({
                            date,
                            format: moment(event.date).format('DD MMMM')
                        });
                        this.eventsByDate[date] = [];
                    }

                    event.meal.imageUrl = this.sharedProvider.setImageUrl(event.meal);

                    let price = JSON.parse(event.price);
                    this.totalAmount += event.localAmount;
                    this.subtotal += event.localAmount * price;
                    event.total = (event.localAmount * price).toFixed(2);

                    this.eventsByDate[date].push(event);
                }
            });

            this.subtotal = this.subtotal.toFixed(2);

            localStorage.setItem('shoppingCart', JSON.stringify(events));
        } catch (err) {
            console.log(err);
        }
    }

    remove(event, slide) {
        if (event.localAmount === 1 || slide) {
            const formattedDate = moment(event.date).format('YYYY-MM-DD');
            const events = JSON.parse(localStorage.getItem('shoppingCart'));

            if (this.eventsByDate[formattedDate].length === 1) {
                delete this.eventsByDate[formattedDate];
                this.dates.forEach((date, index) => {
                    if (date.date === formattedDate) {
                        this.dates.splice(index, 1);
                    }
                });
            } else {
                this.eventsByDate[formattedDate].forEach((evt, index) => {
                    if (evt._id === event._id && evt.meal._id === event.meal._id) {
                        this.eventsByDate[formattedDate].splice(index, 1);
                    }
                });
            }

            events.forEach((evt, index) => {
                if (evt._id === event._id && evt.meal._id && event.meal._id) {
                    events.splice(index, 1);
                }
            });

            this.totalAmount = this.totalAmount - event.localAmount;
            this.subtotal = (parseFloat(this.subtotal) - event.localAmount * JSON.parse(event.price)).toFixed(2);

            localStorage.setItem('shoppingCart', JSON.stringify(events));
            this.events.publish('event:update', event._id, event.mealId, 0);
        } else {
            this.editEvent(event, 'subtract');
        }
    }

    async add(event) {
        if (event.count + event.localAmount >= event.meal.maximum) {
            const subTitle = await this.translateService.get('MAXIMUM_ALERT').toPromise();
            this.alertCtrl.create({
                subTitle,
                buttons: ['Ok']
            }).present();
        } else {
            this.editEvent(event, 'add');
        }
    }

    editEvent(event, operation) {
        if (operation === 'add') {
            this.totalAmount = this.totalAmount + 1;
            this.subtotal = (parseFloat(this.subtotal) + JSON.parse(event.price)).toFixed(2);
        } else {
            this.totalAmount = this.totalAmount - 1;
            this.subtotal = (parseFloat(this.subtotal) - JSON.parse(event.price)).toFixed(2);
        }

        const amount = (operation === 'add') ? event.localAmount + 1 : event.localAmount - 1;

        event.localAmount = amount;
        event.total = (event.localAmount * JSON.parse(event.price)).toFixed(2);
        this.events.publish('event:update', event._id, event.mealId, event.localAmount);

        const events = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        events.forEach(evt => {
            if (evt._id === event._id && evt.meal._id === event.meal._id) {
                evt.localAmount = amount;
            }
        });

        localStorage.setItem('shoppingCart', JSON.stringify(events));
    }

    selectPaymentMethod(method) {
        localStorage.setItem('paymentMethod', method);
        this.sendOrder();
    }

    async checkout() {
        const events = JSON.parse(localStorage.getItem('shoppingCart'));
        const paymentMethod = localStorage.getItem('paymentMethod');

        if (!events.length) {
            return;
        }

        if (!paymentMethod) {
            this.select.open();
            return;
        }

        this.sendOrder();
    }

    async sendOrder() {
        const orders = [];
        const events = JSON.parse(localStorage.getItem('shoppingCart'));

        const loading = this.loadingCtrl.create();
        loading.present();

        events.forEach(({_id, localAmount, date, location, meal, foodEntrepreneur}) => {
            orders.push({
                amount: localAmount,
                date: moment(date).format('YYYY-MM-DD'),
                userId: localStorage.getItem('userId'),
                instanceId: localStorage.getItem('instanceId'),
                calendarEventId: _id,
                locationId: location._id,
                mealId: meal._id,
                foodEntrepreneurId: foodEntrepreneur._id,
            });
        });

        try {
            const data = {
                userId: localStorage.getItem('userId'),
                orders
            };

            await this.http.post('/order', {data});
            localStorage.setItem('shoppingCart', JSON.stringify([]));

            loading.dismiss();
            await this.viewCtrl.dismiss();
            this.modalCtrl.create('order-confirmation', {orders: events})
                .present();
        } catch (err) {
            console.log(err);
            loading.dismiss();
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
