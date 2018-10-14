import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {MealDetailPage} from './meal-detail';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        MealDetailPage,
    ],
    imports: [
        IonicPageModule.forChild(MealDetailPage),
        TranslateModule.forChild()
    ],
})
export class MealDetailPageModule {
}
