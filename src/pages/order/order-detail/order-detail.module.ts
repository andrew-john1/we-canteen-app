import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {OrderDetailPage} from './order-detail';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        OrderDetailPage,
    ],
    imports: [
        IonicPageModule.forChild(OrderDetailPage),
        TranslateModule.forChild()
    ],
})
export class OrderDetailPageModule {
}
