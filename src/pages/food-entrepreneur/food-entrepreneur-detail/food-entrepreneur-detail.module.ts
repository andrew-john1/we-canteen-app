import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FoodEntrepreneurDetailPage} from './food-entrepreneur-detail';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        FoodEntrepreneurDetailPage,
    ],
    imports: [
        IonicPageModule.forChild(FoodEntrepreneurDetailPage),
        TranslateModule.forChild()
    ],
})
export class FoodEntrepreneurDetailPageModule {
}
