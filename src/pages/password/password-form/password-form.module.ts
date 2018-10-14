import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {PasswordFormPage} from './password-form';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        PasswordFormPage,
    ],
    imports: [
        IonicPageModule.forChild(PasswordFormPage),
        TranslateModule.forChild()
    ],
})
export class PasswordFormPageModule {
}
