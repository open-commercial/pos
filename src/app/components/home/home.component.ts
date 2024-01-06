import { Component, AfterViewInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit {
  constructor(private authService: AuthService) {}

  ngAfterViewInit(): void {
    if (!this.authService.user) {
      this.authService.getLoggedInUsuario()?.subscribe();
    }
  }
}
