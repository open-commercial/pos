import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet, LoadingOverlayComponent]
})
export class AppComponent { }
