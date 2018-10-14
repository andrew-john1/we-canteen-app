import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {DomSanitizer} from "@angular/platform-browser";
import {Config} from '../../config';

@Injectable()
export class SharedProvider {

    constructor(private sanitizer: DomSanitizer) {
    }

    setImageUrl(item) {
        let imageUrl;

        if (item.image) {
            imageUrl = this.sanitizer.bypassSecurityTrustStyle(`url('${Config.rootUrl}${item.image.medium}')`);
        } else {
            imageUrl = this.sanitizer.bypassSecurityTrustStyle('url("../assets/img/placeholder.jpg"');
        }

        return imageUrl;
    }

}
