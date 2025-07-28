import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { Component, effect, inject } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  imports: []
})
export class LoadingOverlayComponent {

  loadingOverlayService = inject(LoadingOverlayService);
  active = false;

  constructor() {
    effect(() => {
      this.active = this.loadingOverlayService.isActive();
    });
  }
}
