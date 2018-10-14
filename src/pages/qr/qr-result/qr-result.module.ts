import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {QrResultPage} from './qr-result';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        QrResultPage,
    ],
    imports: [
        IonicPageModule.forChild(QrResultPage),
        TranslateModule.forChild()
    ],
})
export class QrResultPageModule {
}
