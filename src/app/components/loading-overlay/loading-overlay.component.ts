import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { Component, effect } from '@angular/core';

@Component({
    selector: 'app-loading-overlay',
    templateUrl: './loading-overlay.component.html',
    styleUrls: ['./loading-overlay.component.scss'],
    standalone: false
})
export class LoadingOverlayComponent {
  active = false;
  constructor(private loadingOverlayService: LoadingOverlayService) {
    effect(() => {
      this.active = this.loadingOverlayService.isActive();
    });
  }
}
