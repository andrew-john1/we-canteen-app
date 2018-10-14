import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import {SharedProvider} from "../../../providers/shared/shared";

@IonicPage({
    name: 'food-entrepreneurs'
})
@Component({
    selector: 'page-food-entrepreneur-overview',
    templateUrl: 'food-entrepreneur-overview.html',
})
export class FoodEntrepreneurOverviewPage {
    foodEntrepreneurs = [];

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private loadingCtrl: LoadingController,
                private shared: SharedProvider) {
    }

    async ionViewDidLoad() {
        const loader = this.loadingCtrl.create();
        loader.present();

        try {
            const foodEntrepreneurs = await this.http.get('/foodEntrepreneur');
            this.foodEntrepreneurs = foodEntrepreneurs.map(foodEntrepreneur => {
                foodEntrepreneur.imageUrl = this.shared.setImageUrl(foodEntrepreneur);
                return foodEntrepreneur;
            });
        } catch (err) {
            console.log(err);
        }

        loader.dismiss();
    }

    openPage(foodEntrepreneur) {
        this.navCtrl.push('food-entrepreneur', {
            id: foodEntrepreneur._id,
            foodEntrepreneur
        });
    }

}
