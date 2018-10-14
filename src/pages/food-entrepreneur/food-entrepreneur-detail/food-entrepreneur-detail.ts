import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import {SharedProvider} from '../../../providers/shared/shared';

@IonicPage({
    name: 'food-entrepreneur',
    segment: 'food-entrepreneur/:id'
})
@Component({
    selector: 'page-food-entrepreneur-detail',
    templateUrl: 'food-entrepreneur-detail.html',
})
export class FoodEntrepreneurDetailPage {
    id;
    foodEntrepreneur: any = {};

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private shared: SharedProvider,
                private navParams: NavParams) {
        this.id = navParams.get('id');
        this.foodEntrepreneur = navParams.get('foodEntrepreneur');
    }

    async ionViewDidLoad() {
        if (!this.foodEntrepreneur) {
            try {
                this.foodEntrepreneur = await this.http.get(`/foodEntrepreneur/${this.id}`);
            } catch (err) {
                console.log(err);
            }
        }

        this.foodEntrepreneur.imageUrl = this.shared.setImageUrl(this.foodEntrepreneur);
    }
}
