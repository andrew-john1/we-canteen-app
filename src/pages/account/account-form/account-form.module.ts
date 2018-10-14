import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {TranslateModule} from '@ngx-translate/core';
import {AccountFormPage} from "./account-form";

@NgModule({
    declarations: [
        AccountFormPage,
    ],
    imports: [
        IonicPageModule.forChild(AccountFormPage),
        TranslateModule.forChild()
    ],
})
export class SignUpFormPageModule {
}
