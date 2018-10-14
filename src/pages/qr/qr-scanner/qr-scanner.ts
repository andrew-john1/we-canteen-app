import {Component} from '@angular/core';
import {IonicPage, MenuController, ModalController} from 'ionic-angular';
import {QRScanner} from '@ionic-native/qr-scanner';

@IonicPage({
    name: 'qr-scanner'
})
@Component({
    selector: 'page-qr-scanner',
    templateUrl: 'qr-scanner.html',
})
export class QrScannerPage {
    scanSub;

    constructor(private modalCtrl: ModalController,
                private qrScanner: QRScanner) {
    }

    async ionViewDidLoad() {
        try {
            const status = await this.qrScanner.prepare();

            if (status.authorized) {
                // camera permission was granted

                this.scanner();

            } else if (status.denied) {
                // camera permission was permanently denied
                // you must use QRScanner.openSettings() method to guide the user to the settings page
                // then they can grant the permission from there
            } else {
                // permission was denied, but not permanently. You can ask for permission again at a later time.
            }
        } catch (err) {
            console.log(err);
        }
    }

    scanner() {
        // start scanning
        this.scanSub = this.qrScanner.scan().subscribe((orderId: string) => {
            // wait for user to scan something, then the observable callback will be called
            this.scanSub.unsubscribe(); // stop scanning
            this.qrScanner.hide();
            this.openModal(orderId);
        });

        // show camera preview
        this.qrScanner.show();
    }

    async openModal(orderId) {
        const modal = this.modalCtrl.create('qr-result', {orderId});
        await modal.present();

        modal.onDidDismiss(() => {
            this.scanner();
        });
    }

    ionViewDidLeave() {
        this.qrScanner.hide();
        if (this.scanSub) {
            this.scanSub.unsubscribe(); // stop scanning
        }
    }
}
