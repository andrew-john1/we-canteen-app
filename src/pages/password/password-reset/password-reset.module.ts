import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {TranslateModule} from '@ngx-translate/core';
import {PasswordResetPage} from './password-reset';

@NgModule({
    declarations: [
        PasswordResetPage,
    ],
    imports: [
        IonicPageModule.forChild(PasswordResetPage),
        TranslateModule.forChild()
    ],
})
export class PasswordNewPageModule {
}
