import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, Slides, ViewController} from 'ionic-angular';

@IonicPage({
    name: 'meal-explanation'
})
@Component({
    selector: 'page-meal-explanation',
    templateUrl: 'meal-explanation.html',
})
export class MealExplanationPage {
    @ViewChild(Slides) slides: Slides;

    dots = [];
    i = 0;
    safe = false;

    currentIndex: number = 0;

    constructor(private viewCtrl: ViewController) {
    }

    ionViewDidLoad() {
        for (let i = 0; i < 15; i++) {
            this.dots.push({active: false});
        }

        setTimeout(() => {
            this.timeout();
        }, 5000);
    }

    slideWillChange() {
        const activeIndex = this.slides.getActiveIndex();
        if (activeIndex < 0 || activeIndex > 1) {
            return;
        }
        this.currentIndex = activeIndex;
    }

    timeout() {
        setTimeout(() => {
            this.dots[this.i].active = true;

            if (this.i < 14) {
                this.i++;
                this.timeout();
            } else {
                this.i = 0;
                this.safe = true;
            }
        }, 300);
    }

    next() {
        if (this.currentIndex === 1) {
            this.viewCtrl.dismiss();
        } else {
            this.slides.slideTo(1);
        }
    }

}
