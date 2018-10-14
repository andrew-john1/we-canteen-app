import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {TranslateModule} from '@ngx-translate/core';
import {AccountActivatePage} from "./account-activate";

@NgModule({
    declarations: [
        AccountActivatePage,
    ],
    imports: [
        IonicPageModule.forChild(AccountActivatePage),
        TranslateModule.forChild()
    ],
})
export class SignUpActivatePageModule {
}
