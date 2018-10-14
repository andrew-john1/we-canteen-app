import {Component, ViewChild} from '@angular/core';
import {AlertController, Events, IonicPage, LoadingController, MenuController, ModalController, NavController, Slides} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import * as moment from 'moment';
import {SharedProvider} from '../../../providers/shared/shared';

const language = localStorage.getItem('language');
moment.locale(language);

@IonicPage({
    name: 'meals'
})
@Component({
    selector: 'page-meal-overview',
    templateUrl: 'meal-overview.html',
})
export class MealOverviewPage {
    @ViewChild(Slides) slides: Slides;

    navigationDates = [];
    events = [];
    locations = [];
    locationId;
    datesIndex = 0;
    shoppingCartCount = 0;
    localAmountObject = {};
    loader;

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private shared: SharedProvider,
                private eventsService: Events,
                private loadingCtrl: LoadingController,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController) {
        eventsService.subscribe('shoppingCart:count', count => {
            if (this.shoppingCartCount !== count) {
                this.shoppingCartCount = count;
            }
        });

        eventsService.subscribe('events:sort', () => {
            this.sortEvents();
        });

        eventsService.subscribe('event:update', (eventId, mealId, amount) => {
            console.log(eventId, mealId, amount);
            this.editEvent(eventId, mealId, amount);
        });
    }

    async ionViewDidLoad() {
        this.loader = this.loadingCtrl.create();
        this.loader.present();

        try {
            const instanceId = localStorage.getItem('instanceId');
            const explanation = localStorage.getItem('explanation');
            let locationId = localStorage.getItem('locationId');

            if (!explanation) {
                const modal = this.modalCtrl.create('meal-explanation', {}, {cssClass: 'order meal'});
                modal.present();
                modal.onDidDismiss(() => {
                    localStorage.setItem('explanation', 'true');
                });
            }

            this.locations = await this.http.get(`/location/instance/${instanceId}`);

            if (!locationId) {
                locationId = this.locations[0]._id;
                localStorage.setItem('locationId', locationId);
            }

            this.locationId = locationId;
            this.setShoppingCartAmount();
            this.setLocalCount();
            this.getData(locationId);
        } catch (err) {
            console.log(err);
            this.loader.dismiss();
        }
    }

    setShoppingCartAmount() {
        this.shoppingCartCount = 0;

        const shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        shoppingCart.forEach(event => {
            this.shoppingCartCount += event.localAmount;
        });
    }

    setLocalCount() {
        this.localAmountObject = {};
        const shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        shoppingCart.forEach(event => {
            if (!this.localAmountObject[event._id]) {
                this.localAmountObject[event._id] = {};
            }

            if (!this.localAmountObject[event._id][event.mealId]) {
                this.localAmountObject[event._id][event.mealId] = event.localAmount;
            } else {
                this.localAmountObject[event._id][event.mealId] += event.localAmount;
            }
        });
    }

    editLocalCount() {
        this.events.forEach(list => {
            list.forEach(event => {
                event.localAmount = 0;

                if (this.localAmountObject[event._id] && this.localAmountObject[event._id][event.mealId]) {
                    event.localAmount = this.localAmountObject[event._id] && this.localAmountObject[event._id][event.mealId];
                    event.percentage = Math.round(((event.count + event.localAmount) / event.meal.minimum) * 100);
                    event.safe = event.percentage >= 100;
                }
            });
        });
    }

    editEvent(eventId, mealId, amount) {
        this.events.forEach(list => {
            list.forEach(event => {
                if (event._id === eventId && event.mealId === mealId) {
                    event.localAmount = amount;
                }
            }) ;
        });

        this.sortEvents();
    }

    sortEvents() {
        this.events.forEach((list, i) => {
            this.events[i] = this.events[i].map(event => {
                event.percentage = Math.round(((event.count + event.localAmount) / event.meal.minimum) * 100);
                event.max = event.count + event.localAmount >= event.meal.maximum;
                event.safe = event.percentage >= 100;
                return event;
            }).sort((a, b) => {
                if (a.max !== b.max) return a.max ? 1 : -1;
                if (a.percentage !== b.percentage) return b.percentage - a.percentage;
                return a.meal.name > b.meal.name;
            });
        });
    }

    async getData(locationId) {
        const tomorrow = moment().add(1, 'day').startOf('day').format();
        const twoWeeksFromTomorrow = moment(tomorrow).add(2, 'weeks').format();

        const data = {
            locationId,
            tomorrow,
            twoWeeksFromTomorrow
        };

        try {
            this.events = [];
            this.navigationDates = [];

            const mealIdsRequest = [];
            const foodEntrepreneurIds = [];
            const ordersRequest = [];

            const calendarEvents = await this.http.post('/calendarEvent/dates', {data});

            if (!calendarEvents.length) {
                this.alertCtrl.create({
                    subTitle: 'No meals available',
                    buttons: ['Ok']
                }).present();
            } else {
                calendarEvents.forEach(({_id, date, foodEntrepreneurId, mealIds, locationId}) => {
                    let formattedDate = moment(date).format('YYYY-MM-DD');

                    if (foodEntrepreneurIds.indexOf(foodEntrepreneurId) === -1) {
                        foodEntrepreneurIds.push(foodEntrepreneurId);
                    }

                    let found = -1;

                    this.navigationDates.forEach((item, index) => {
                        if (item.format === formattedDate) {
                            found = index;
                        }
                    });

                    if (found === -1) {
                        let diff = moment(date).subtract(1, 'day').endOf('day').diff(moment(), 'hours');

                        this.navigationDates.push({
                            day: moment(date).format('ddd').slice(0, -1),
                            date: moment(date).get('date'),
                            format: formattedDate,
                            timeFromNow: moment(date).subtract(1, 'day').endOf('day').fromNow(),
                            warning: diff <= 24
                        });

                        this.events.push([]);
                    }

                    const index = (found === -1) ? this.events.length - 1 : found;

                    mealIds.forEach(mealId => {
                        this.events[index].push({
                            _id,
                            mealId,
                            locationId,
                            foodEntrepreneurId,
                            date
                        });

                        ordersRequest.push({
                            mealId,
                            calendarEventId: _id
                        });

                        if (mealIdsRequest.indexOf(mealId) === -1) {
                            mealIdsRequest.push(mealId);
                        }
                    });
                });

                const instanceId = localStorage.getItem('instanceId');
                const firstDate = this.navigationDates[0].format;
                const lastDate = this.navigationDates[this.navigationDates.length - 1].format;

                [1, 2, 3].forEach(number => {
                    this.navigationDates.unshift({
                        date: moment(firstDate).subtract(number, 'day').get('date'),
                        day: moment(firstDate).subtract(number, 'days').format('ddd').slice(0, -1),
                        inactive: true
                    });
                    this.navigationDates.push({
                        date: moment(lastDate).add(number, 'day').get('date'),
                        day: moment(lastDate).add(number, 'days').format('ddd').slice(0, -1),
                        inactive: true
                    });
                });

                const [
                    instance,
                    meals,
                    foodEntrepreneurs,
                    ordersResult
                ] = await Promise.all([
                    this.http.get(`/instance/${instanceId}`),
                    this.http.post('/meal/ids', {ids: mealIdsRequest}),
                    this.http.post('/foodEntrepreneur/ids', {ids: foodEntrepreneurIds}),
                    this.http.post('/order/count', {data: ordersRequest})
                ]);

                const mealsObject = {};
                const foodEntrepreneursObject = {};
                const locationsObject = {};
                const ordersCountObject = {};

                meals.forEach(meal => {
                    meal.imageUrl = this.shared.setImageUrl(meal);
                    mealsObject[meal._id] = meal;
                });

                foodEntrepreneurs.forEach(foodEntrepreneur => {
                    foodEntrepreneursObject[foodEntrepreneur._id] = foodEntrepreneur;
                });

                this.locations.forEach(location => {
                    locationsObject[location._id] = location;
                });

                ordersResult.forEach(orders => {
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

                this.events.forEach((list, i) => {
                    this.events[i] = this.events[i].map(event => {
                        let calendarEventId = event._id;
                        let mealId = event.mealId;

                        event.meal = mealsObject[event.mealId];
                        event.foodEntrepreneur = foodEntrepreneursObject[event.foodEntrepreneurId];
                        event.location = locationsObject[event.locationId];
                        event.formattedDate = moment(event.date).format('LL');
                        event.dotsAmount = new Array(event.meal.minimum);

                        if (ordersCountObject[calendarEventId] && ordersCountObject[calendarEventId][mealId]) {
                            event.count = ordersCountObject[calendarEventId][mealId];
                        } else {
                            event.count = 0;
                        }

                        if (this.localAmountObject[calendarEventId] && this.localAmountObject[calendarEventId][mealId]) {
                            event.localAmount = this.localAmountObject[calendarEventId][mealId];
                        } else {
                            event.localAmount = 0;
                        }

                        event.percentage = Math.round(((event.count + event.localAmount) / event.meal.minimum) * 100);
                        event.max = event.count + event.localAmount >= event.meal.maximum;
                        event.safe = event.percentage >= 100;

                        if (event.meal.price) {
                            event.price = event.meal.price;
                        } else {
                            event.price = instance.price;
                        }

                        return event;
                    }).sort((a, b) => {
                        if (a.max !== b.max) return a.max ? 1 : -1;
                        if (a.percentage !== b.percentage) return b.percentage - a.percentage;
                        return a.meal.name > b.meal.name;
                    });
                });
            }

            this.loader.dismiss();
        } catch (err) {
            console.log(err);
            this.loader.dismiss();
        }
    }

    changeLocation(locationId) {
        localStorage.setItem('locationId', locationId);
        this.getData(locationId);
    }

    changeDate(index) {
        const datesLenght = this.navigationDates.length;

        if (index <= 2 || index >= datesLenght - 3) {
            return;
        }

        this.slides.slideTo(index - 3);
    }

    ionSlideWillChange(event) {
        this.datesIndex = event.realIndex;
    }

    openPage(event) {
        this.navCtrl.push('meal-detail', {
            event,
            eventId: event._id,
            mealId: event.mealId
        });
    }

    openShoppingCart() {
        const modal = this.modalCtrl.create('shopping-cart');
        modal.present();
        modal.onDidDismiss(() => {
            this.setShoppingCartAmount();
            this.setLocalCount();
            this.editLocalCount();
            this.sortEvents();
        });
    }
}
