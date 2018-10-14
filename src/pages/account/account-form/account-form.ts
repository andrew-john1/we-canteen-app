import {Component} from '@angular/core';
import {IonicPage, NavController, LoadingController, AlertController} from 'ionic-angular';
import {HttpProvider} from '../../../providers/http/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";

@IonicPage({
    name: 'account-form'
})
@Component({
    selector: 'page-account-form',
    templateUrl: 'account-form.html',
    providers: [HttpProvider]
})
export class AccountFormPage {

    formSend = false;
    user: any = {};
    instances = [];
    companies = [];
    companiesByInstance = {};
    companiesObject = {};
    form: FormGroup;
    instanceId;
    formError = false;
    placeholder = 'Email';

    constructor(private navCtrl: NavController,
                private http: HttpProvider,
                private loadingCtrl: LoadingController,
                private formBuilder: FormBuilder,
                private translateService: TranslateService,
                private alertCtrl: AlertController) {
        this.form = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            instanceId: ['', Validators.required],
            companyId: '',
            email: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.form.valueChanges.subscribe(({instanceId, companyId}) => {
            this.inputChange(instanceId, companyId);
        });
    }

    async ionViewDidLoad() {
        try {
            const [
                instances,
                companies
            ] = await Promise.all([
                this.http.getWithoutToken('/guest/instances'),
                this.http.getWithoutToken('/guest/companies')
            ]);

            this.instances = instances;

            companies.forEach(company => {
                if (!this.companiesByInstance[company.instanceId]) {
                    this.companiesByInstance[company.instanceId] = [];
                }

                this.companiesByInstance[company.instanceId].push(company);
                this.companiesObject[company._id] = company;
            });
        } catch (err) {
            console.log(err);
        }
    }

    inputChange(instanceId, companyId) {
        if (instanceId && instanceId !== this.instanceId) {
            this.instanceId = instanceId;
            this.companies = this.companiesByInstance[instanceId];

            if (this.companies.length <= 1) {
                this.placeholder = 'julian.stork'.concat(this.companies[0].emailDomain);
                this.form.controls['companyId'].setValue(this.companies[0]._id);
            } else {
                this.form.controls['companyId'].setValue('');
                this.placeholder = 'Email';

                setTimeout(() => {
                    this.form.controls['companyId'].setErrors({required: true});
                }, 0);
            }
        } else if (companyId && this.companies.length > 1) {
            this.companies.forEach(company => {
                if (company._id === companyId) {
                    this.placeholder = 'julian.stork'.concat(company.emailDomain);
                }
            });
        }
    }

    setEmailPlaceholder() {

    }

    async onSubmit(form) {
        this.formSend = true;

        if (form.email && form.companyId) {
            const company = this.companiesObject[form.companyId];
            const indexOf = form.email.indexOf(company.emailDomain);

            if (indexOf === -1) {
                this.form.controls['email'].setErrors({emailDomain: false});
            }
        }

        if (this.form.valid) {
            const loading = this.loadingCtrl.create();
            loading.present();

            try {
                await this.http.postWithoutToken('/guest/account', {user: form});
                const subTitle = await this.translateService.get('ACCOUNT_ALERT_TEXT').toPromise();

                loading.dismiss();

                const modal = this.alertCtrl.create({
                    subTitle,
                    buttons: ['Ok']
                });

                modal.present();
                modal.onDidDismiss(() => {
                    this.navCtrl.setRoot('login');
                });

            } catch (err) {
                console.log(err);
                loading.dismiss();
                this.form.controls['email'].setErrors({validEmail: false});
            }
        }

    }

}
