import {Component, ViewChild} from '@angular/core';
import {IonicPage, MenuController, NavController, Slides} from 'ionic-angular';

@IonicPage({
    name: 'onboarding'
})
@Component({
    selector: 'page-onboarding',
    templateUrl: 'onboarding.html'
})
export class OnboardingPage {
    @ViewChild(Slides) slides: Slides;

    currentIndex: number = 0;

    constructor(private navCtrl: NavController,
                private menuCtrl: MenuController) {
        menuCtrl.enable(false);
    }

    slideWillChange() {
        const activeIndex = this.slides.getActiveIndex();
        if (activeIndex < 0 || activeIndex > 4) {
            return;
        }
        this.currentIndex = activeIndex;
    }

    start() {
        localStorage.setItem('onBoarding', 'true');
        this.navCtrl.setRoot('login');
    }

}
