import {Component} from '@angular/core';
import {IonicPage, NavController, LoadingController, AlertController} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpProvider} from '../../../providers/http/http';
import {TranslateService} from "@ngx-translate/core";

@IonicPage({
    name: 'password-form'
})
@Component({
    selector: 'page-password-form',
    templateUrl: 'password-form.html',
})
export class PasswordFormPage {
    formSend = false;
    form: FormGroup;

    constructor(private navCtrl: NavController,
                private formBuilder: FormBuilder,
                private http: HttpProvider,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                private translateService: TranslateService) {
        this.form = this.formBuilder.group({
            email: ['', Validators.required]
        });
    }

    ionViewDidLoad() {

    }

    async onSubmit({email}) {
        this.formSend = true;

        if (this.form.valid) {
            const loading = this.loadingCtrl.create();
            loading.present();

            try {
                await this.http.postWithoutToken('/guest/passwordHash', {email});
                const subTitle = await this.translateService.get('PASSWORD_ALERT_TEXT').toPromise();

                loading.dismiss();

                await Promise.all([
                    this.navCtrl.setRoot('login'),
                    this.alertCtrl.create({
                        subTitle,
                        buttons: ['Ok']
                    }).present()
                ]);
            } catch (err) {
                console.log(err);
                loading.dismiss();
                this.form.controls['email'].setErrors({valid: false});
            }
        }
    }

}
