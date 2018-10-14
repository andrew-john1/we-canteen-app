import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, Slides, ModalController, LoadingController} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import {Config} from '../../../config';
import {SharedProvider} from '../../../providers/shared/shared';
import * as moment from 'moment';

@IonicPage({
    name: 'orders'
})
@Component({
    selector: 'page-order-overview',
    templateUrl: 'order-overview.html',
})
export class OrderOverviewPage {
    @ViewChild(Slides) slides: Slides;

    pastOrders = {};
    pendingOrders = {};
    takeAwayOrders = {};

    pastDates = [];
    pendingDates = [];
    takeAwayDates = [];

    activeSlide: number = 0;

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private modalCtrl: ModalController,
                private loadingCtrl: LoadingController,
                private shared: SharedProvider) {
    }

    async ionViewDidLoad() {
        this.pastOrders = {};
        this.pendingOrders = {};
        this.takeAwayOrders = {};

        this.pastDates = [];
        this.pendingDates = [];
        this.takeAwayDates = [];

        const loader = this.loadingCtrl.create();
        loader.present();

        try {
            const userId = localStorage.getItem('userId');
            const instanceId = localStorage.getItem('instanceId');
            const orders = await this.http.get(`/order/user/${userId}`);

            const mealIds = [];
            const foodEntrepreneurIds = [];
            const locationIds = [];
            const calendarEventIds = [];
            const orderCountRequest = [];

            orders.forEach(order => {
                let found = -1;
                orderCountRequest.forEach((ord, index) => {
                    if (ord.mealId === order.mealId && ord.calendarEventId === order.calendarEventId) {
                        found = index;
                    }
                });

                if (found === -1) {
                    orderCountRequest.push({
                        mealId: order.mealId,
                        calendarEventId: order.calendarEventId
                    });
                }

                if (mealIds.indexOf(order.mealId) === -1) {
                    mealIds.push(order.mealId);
                }

                if (foodEntrepreneurIds.indexOf(order.foodEntrepreneurId) === -1) {
                    foodEntrepreneurIds.push(order.foodEntrepreneurId);
                }

                if (locationIds.indexOf(order.locationId) === -1) {
                    locationIds.push(order.locationId);
                }

                if (calendarEventIds.indexOf(order.calendarEventId) === -1) {
                    calendarEventIds.push(order.calendarEventId);
                }
            });

            const [
                instance,
                meals,
                foodEntrepreneurs,
                locations,
                orderCounts,
                calendarEvents,
            ] = await Promise.all([
                this.http.get(`/instance/${instanceId}`),
                this.http.post('/meal/ids', {ids: mealIds}),
                this.http.post('/foodEntrepreneur/ids', {ids: foodEntrepreneurIds}),
                this.http.post('/location/ids', {ids: locationIds}),
                this.http.post('/order/count', {data: orderCountRequest}),
                this.http.post('/calendarEvent/ids', {ids: calendarEventIds})
            ]);

            const mealsObject = {};
            const foodEntrepreneursObject = {};
            const locationsObject = {};
            const ordersCountObject = {};
            const calendarEventsObject = {};

            meals.forEach(meal => {
                meal.imageUrl = this.shared.setImageUrl(meal);
                mealsObject[meal._id] = meal;
            });

            foodEntrepreneurs.forEach(foodEntrepreneur => {
                foodEntrepreneursObject[foodEntrepreneur._id] = foodEntrepreneur;
            });

            locations.forEach(location => {
                locationsObject[location._id] = location;
            });

            calendarEvents.forEach(calendarEvent => {
                calendarEventsObject[calendarEvent._id] = calendarEvent;
            });

            orderCounts.forEach(orders => {
                if (orders.length) {
                    orders.forEach(order => {
                        let calendarEventId = order.calendarEventId;
                        let mealId = order.mealId;

                        if (!ordersCountObject[calendarEventId]) {
                            ordersCountObject[calendarEventId] = {};
                        }

                        if (!ordersCountObject[calendarEventId][mealId]) {
                            ordersCountObject[calendarEventId][mealId] = order.amount;
                        } else {
                            ordersCountObject[calendarEventId][mealId] += order.amount;
                        }
                    });
                }
            });

            orders.forEach(order => {
                let mealId = order.mealId;
                let calendarEventId = order.calendarEventId;

                order.imageUrl = `${Config.rootUrl}/uploads/instances/${order.instanceId}/locations/${order.locationId}/orders/${order._id}.png`;
                order.displayDate = moment(order.date).format('ll');

                order.meal = mealsObject[order.mealId];
                order.foodEntrepreneur = foodEntrepreneursObject[order.foodEntrepreneurId];
                order.location = locationsObject[order.locationId];
                order.calendarEvent = calendarEventsObject[order.calendarEventId];
                order.date = calendarEventsObject[order.calendarEventId].date;
                order.dotsAmount = new Array(order.meal.minimum);

                if (order.meal.price) {
                    order.price = order.meal.price;
                } else {
                    order.price = instance.price;
                }

                if (ordersCountObject[calendarEventId] && ordersCountObject[calendarEventId][mealId]) {
                    order.count = ordersCountObject[calendarEventId][mealId];
                } else {
                    order.count = 0;
                }

                order.percentage = Math.round((order.count / order.meal.minimum) * 100);

                let dates;
                let orders;
                let isPast = moment(order.date) < moment().endOf('day');
                let date = moment(order.date).format('YYYY-MM-DD');

                if (isPast || order.received) {
                    this.pastOrders[date] = this.pastOrders[date] || [];
                    orders = this.pastOrders[date];
                    dates = this.pastDates;
                } else if (order.count >= order.meal.minimum) {
                    this.takeAwayOrders[date] = this.takeAwayOrders[date] || [];
                    orders = this.takeAwayOrders[date];
                    dates = this.takeAwayDates;
                } else {
                    this.pendingOrders[date] = this.pendingOrders[date] || [];
                    orders = this.pendingOrders[date];
                    dates = this.pendingDates;
                }

                let found = -1;

                dates.forEach((d, index) => {
                    if (d.date === date) {
                        found = index;
                    }
                });

                if (found === -1) {
                    dates.push({
                        date,
                        title: moment(order.date).format('DD MMMM')
                    });
                }

                orders.push(order);
            });

            if (!this.takeAwayDates.length && this.pendingDates.length) {
                this.slides.slideTo(1);
                this.activeSlide = 1;
            }

            [
                this.pendingDates,
                this.takeAwayDates
            ].forEach(dates => {
                dates.sort((a, b) => {
                    if (moment(a.date).format('YYYY-MM-DD') < moment(b.date).format('YYYY-MM-DD')) return -1;
                    if (moment(a.date).format('YYYY-MM-DD') > moment(b.date).format('YYYY-MM-DD')) return 1;
                    return 0;
                });
            });

            this.pastDates.sort((a, b) => {
                if (moment(a.date).format('YYYY-MM-DD') > moment(b.date).format('YYYY-MM-DD')) return -1;
                if (moment(a.date).format('YYYY-MM-DD') < moment(b.date).format('YYYY-MM-DD')) return 1;
                return 0;
            });

            [
                this.pastOrders,
                this.takeAwayOrders,
            ].forEach(orders => {
                for (let date in orders) {
                    orders[date].sort((a, b) => {
                        if (a.meal.name < b.meal.name) return -1;
                        if (a.meal.name > b.meal.name) return 1;
                        return 0;
                    });
                }
            });

            for (let date in this.pendingOrders) {
                this.pendingOrders[date].sort((a, b) => {
                    if (a.percentage !== b.percentage) return b.percentage - a.percentage;
                    return a.meal.name > b.meal.name;
                });
            }
        } catch (err) {
            console.log(err);
        }

        loader.dismiss();
    }

    slideWillChange({realIndex}) {
        this.activeSlide = realIndex;
    }

    changeSlide(index) {
        this.slides.slideTo(index);
        this.activeSlide = index;
    }

    openPage(order) {
        const modal = this.modalCtrl.create('order-detail',
            {order},
            {cssClass: 'order ticket'}
        );

        // this.modalCtrl.create('qr-result', {orderId: order._id})
        //     .present();

        modal.present();
        modal.onDidDismiss(() => {
            this.http.get(`/order/${order._id}`)
                .then(result => {
                    if (result.received === true) {
                        const date = moment(order.date).format('YYYY-MM-DD');

                        this.pastOrders[date] = this.pastOrders[date] || [];
                        this.pastOrders[date].push(order);

                        this.pastOrders[date].sort((a, b) => {
                            if (a.meal.name < b.meal.name) return -1;
                            if (a.meal.name > b.meal.name) return 1;
                            return 0;
                        });

                        let found = -1;
                        this.pastDates.forEach((d, index) => {
                            if (d.date === date) {
                                found = index;
                            }
                        });

                        if (found === -1) {
                            this.pastDates.push({
                                date,
                                title: moment(order.date).format('DD MMMM')
                            });
                        }

                        this.pastDates.sort((a, b) => {
                            if (moment(a.date).format('YYYY-MM-DD') > moment(b.date).format('YYYY-MM-DD')) return -1;
                            if (moment(a.date).format('YYYY-MM-DD') < moment(b.date).format('YYYY-MM-DD')) return 1;
                            return 0;
                        });

                        const takeAwayOrdersLength = this.takeAwayOrders[date].length;
                        if (takeAwayOrdersLength <= 1) {
                            this.takeAwayDates.forEach((d, index) => {
                                if (d.date === date) {
                                    this.takeAwayDates.splice(index, 1);
                                }
                            });
                        }

                        this.takeAwayOrders[date].forEach((ord, index) => {
                            if (ord._id === order._id) {
                                this.takeAwayOrders[date].splice(index, 1);
                            }
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        });
    }

    openMealPage(event) {
        event._id = event.calendarEvent._id;
        event.formattedDate = moment(event.calendarEvent.date).format('LL');
        console.log(event);
        this.navCtrl.push('meal-detail', {
            event,
            eventId: event.calendarEvent._id,
            mealId: event.meal._id
        });
    }

}
