import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {MealOverviewPage} from './meal-overview';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        MealOverviewPage,
    ],
    imports: [
        IonicPageModule.forChild(MealOverviewPage),
        TranslateModule.forChild()
    ],
})
export class MealOverviewPageModule {
}
