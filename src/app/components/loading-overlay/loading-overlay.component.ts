import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { Component, effect, inject } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  imports: [FontAwesomeModule]
})
export class LoadingOverlayComponent {

  loadingOverlayService = inject(LoadingOverlayService);
  active = false;
  icons = {
    spinner: faSpinner
  }

  constructor() {
    effect(() => {
      this.active = this.loadingOverlayService.isActive();
    });
  }
}
