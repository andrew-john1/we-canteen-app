import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {MealExplanationPage} from './meal-explanation';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        MealExplanationPage,
    ],
    imports: [
        IonicPageModule.forChild(MealExplanationPage),
        TranslateModule.forChild()
    ],
})
export class MealExplanationPageModule {
}
