import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {TranslateModule} from '@ngx-translate/core';
import {QrScannerPage} from './qr-scanner';

@NgModule({
    declarations: [
        QrScannerPage,
    ],
    imports: [
        IonicPageModule.forChild(QrScannerPage),
        TranslateModule.forChild()
    ],
})
export class QrScannerPageModule {
}
