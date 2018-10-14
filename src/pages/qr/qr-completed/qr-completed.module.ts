import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {QrCompletedPage} from './qr-completed';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        QrCompletedPage,
    ],
    imports: [
        IonicPageModule.forChild(QrCompletedPage),
        TranslateModule.forChild()
    ],
})
export class QrCompletedPageModule {
}
