import {Component} from '@angular/core';
import {AlertController, Events, IonicPage, ModalController, NavController, NavParams} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import * as moment from 'moment';
import {SharedProvider} from '../../../providers/shared/shared';
import {TranslateService} from '@ngx-translate/core';

@IonicPage({
    name: 'meal-detail',
    segment: 'meal/:eventId/:mealId'
})
@Component({
    selector: 'page-meal-detail',
    templateUrl: 'meal-detail.html',
})
export class MealDetailPage {
    event: any = {};
    eventId;
    mealId;
    shoppingCartCount = 0;
    transformShoppingCart = false;
    totalOrderCount = 0;
    isFuture = true;
    showFooter = true;

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private alertCtrl: AlertController,
                private events: Events,
                private modalCtrl: ModalController,
                private translateService: TranslateService,
                private shared: SharedProvider,
                private navParams: NavParams) {
        this.event = navParams.get('event');
        this.eventId = navParams.get('eventId');
        this.mealId = navParams.get('mealId');
    }

    async ionViewDidLoad() {
        if (!this.event) {
            try {
                const [
                    event,
                    meal
                ] = await Promise.all([
                    this.http.get(`/calendarEvent/${this.eventId}`),
                    this.http.get(`/meal/${this.mealId}`)
                ]);

                meal.imageUrl = this.shared.setImageUrl(meal);

                this.event = event;
                this.event.meal = meal;
                this.event.mealId = this.mealId;
                this.event.formattedDate = moment(this.event.date).format('LL');
                this.event.dotsAmount = new Array(event.meal.minimum);

                const instanceId = localStorage.getItem('instanceId');
                const data = {
                    mealId: meal._id,
                    calendarEventId: event._id
                };

                const [
                    instance,
                    foodEntrepreneur,
                    location,
                    orders
                ] = await Promise.all([
                    this.http.get(`/instance/${instanceId}`),
                    this.http.get(`/foodEntrepreneur/${event.foodEntrepreneurId}`),
                    this.http.get(`/location/${event.locationId}`),
                    this.http.post('/order/count/single', {data})
                ]);

                this.event.count = 0;

                orders.forEach(order => {
                    this.event.count += order.amount;
                });

                if (this.event.meal.price) {
                    this.event.price = this.event.meal.price;
                } else {
                    this.event.price = instance.price;
                }

                this.event.foodEntrepreneur = foodEntrepreneur;
                this.event.location = location;
            } catch (err) {
                console.log(err);
            }
        }

        this.setShoppingCartAmount();
        this.event.detailAmount = 1;
        this.event.min = this.event.count < this.event.meal.minimum;
        this.event.max = this.event.count >= this.event.meal.maximum;

        this.isFuture = moment(this.event.date) > moment().endOf('day');
        this.showFooter = this.event.count + this.event.localAmount < this.event.meal.maximum;
    }

    returnTotalCount() {
        return this.event.localAmount + this.event.count + this.event.detailAmount;
    }

    setShoppingCartAmount() {
        this.shoppingCartCount = 0;
        this.event.localAmount = 0;

        const shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        shoppingCart.forEach(order => {
            this.shoppingCartCount += order.localAmount;

            if (order.mealId === this.mealId && order._id === this.eventId) {
                this.event.localAmount = order.localAmount;
            }
        });

        this.events.publish('shoppingCart:count', this.shoppingCartCount);
    }

    remove() {
        if (this.event.detailAmount > 1) {
            this.event.detailAmount--;
        }
    }

    add() {
        const total = this.returnTotalCount() + 1;
        if (total >= this.event.meal.maximum) {
            this.displayModal();
        } else {
            this.event.detailAmount++;
        }
    }

    displayModal() {
        this.alertCtrl.create({
            subTitle: 'You have reached the maximum amount',
            buttons: ['Ok']
        }).present();
    }

    addToCart(order) {
        const totalAmount = this.returnTotalCount();

        if (totalAmount > order.meal.maximum) {
            this.displayModal();
        } else {
            this.transformShoppingCart = true;
            this.shoppingCartCount += order.detailAmount;
            this.event.localAmount += order.detailAmount;
            this.events.publish('shoppingCart:count', this.shoppingCartCount);
            this.events.publish('events:sort');

            if (totalAmount === order.meal.maximum) {
                this.showFooter = false;
            }

            setTimeout(() => {
                this.transformShoppingCart = false;
            }, 500);

            let found = -1;
            let events = JSON.parse(localStorage.getItem('shoppingCart')) || [];

            events.forEach((event, index) => {
                if (event._id === this.eventId && event.meal._id === this.mealId) {
                    found = index;
                }
            });

            if (found === -1) {
                order.date = moment(order.date).format();
                events.push(order);
            } else {
                events[found].localAmount += order.detailAmount;
            }

            events.sort((a, b) => {
                if (moment(a.date).format('YYYY-MM-DD') < moment(b.date).format('YYYY-MM-DD')) return -1;
                if (moment(a.date).format('YYYY-MM-DD') > moment(b.date).format('YYYY-MM-DD')) return 1;
                return a.meal.name > b.meal.name;
            });

            console.log(events);

            order.detailAmount = 1;
            localStorage.setItem('shoppingCart', JSON.stringify(events));
        }
    }

    openShoppingCart() {
        const modal = this.modalCtrl.create('shopping-cart');

        modal.present();
        modal.onDidDismiss(() => {
            this.setShoppingCartAmount();
            this.showFooter = this.event.count + this.event.localAmount < this.event.meal.maximum;
            console.log('event after', this.event);
        });
    }

    openPage(foodEntrepreneur) {
        this.navCtrl.push('food-entrepreneur', {
            foodEntrepreneur,
            id: foodEntrepreneur._id
        });
    }
}
