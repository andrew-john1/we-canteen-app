import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FoodEntrepreneurOverviewPage} from './food-entrepreneur-overview';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        FoodEntrepreneurOverviewPage,
    ],
    imports: [
        IonicPageModule.forChild(FoodEntrepreneurOverviewPage),
        TranslateModule.forChild()
    ],
})
export class FoodEntrepreneurOverviewPageModule {
}
