import {Component} from '@angular/core';
import {IonicPage, MenuController, NavController, NavParams, LoadingController} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpProvider} from '../../providers/http/http';
import {AuthProvider} from '../../providers/auth/auth';
import {WeCanteenApp} from '../../app/app.component';

@IonicPage({
    name: 'login'
})
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    formSend = false;
    formError = false;
    form: FormGroup;

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private menuCtrl: MenuController,
                private auth: AuthProvider,
                private loadingCtrl: LoadingController,
                private formBuilder: FormBuilder,
                private navParams: NavParams) {
        menuCtrl.enable(false);

        this.form = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ionViewDidLoad() {
    }

    openPage(page) {
        this.navCtrl.push(page);
    }

    async onSubmit(form) {
        this.formSend = true;

        if (this.form.valid) {
            const loading = this.loadingCtrl.create();
            loading.present();

            try {
                await this.http.postWithoutToken('/guest/preLogin', {user: form});

                const response = await this.http.login(form);
                this.auth.setToken(response);

                loading.dismiss();
                this.navCtrl.setRoot(WeCanteenApp);
            } catch (err) {
                console.log(err);
                loading.dismiss();
                this.formError = true;
            }
        }
    }
}
