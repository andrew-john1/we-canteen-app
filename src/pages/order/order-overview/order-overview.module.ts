import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {OrderOverviewPage} from './order-overview';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        OrderOverviewPage,
    ],
    imports: [
        IonicPageModule.forChild(OrderOverviewPage),
        TranslateModule.forChild()
    ],
})
export class OrderOverviewPageModule {
}
