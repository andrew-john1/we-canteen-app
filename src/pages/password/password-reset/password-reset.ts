import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, AlertController} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";

@IonicPage({
    name: 'password-reset',
    segment: 'password-reset/:hash'
})
@Component({
    selector: 'page-password-reset',
    templateUrl: 'password-reset.html',
})
export class PasswordResetPage {
    hash;
    formSend = false;
    form: FormGroup;
    formError = false;

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private loadingCtrl: LoadingController,
                private formBuilder: FormBuilder,
                private alertCtrl: AlertController,
                private translateService: TranslateService,
                private navParams: NavParams) {
        this.hash = navParams.get('hash');

        this.form = formBuilder.group({
            password: ['', Validators.required]
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad PasswordConfirmedPage');
    }

    async onSubmit({password}) {
        this.formSend = true;

        const data =  {
            password,
            hash: this.hash
        };

        if (this.form.valid) {
            const loading = this.loadingCtrl.create();
            loading.present();

            try {
                await this.http.postWithoutToken('/guest/passwordReset', {data});
                const subTitle = await this.translateService.get('RESET_ALERT_TEXT').toPromise();

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
                this.formError = true;
            }
        }
    }

}
