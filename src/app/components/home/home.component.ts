import { Component, AfterViewInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [RouterOutlet, NavbarComponent],
})
export class HomeComponent implements AfterViewInit {

  authService = inject(AuthService);

  ngAfterViewInit(): void {
    if (!this.authService.user) {
      this.authService.getLoggedInUsuario()?.subscribe();
    }
  }
}
