import { Component, AfterViewInit, inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ProductosComponent } from "../productos/productos.component";
import { CheckoutComponent } from "../checkout/checkout.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [ProductosComponent, CheckoutComponent]
})
export class HomeComponent implements AfterViewInit {

  authService = inject(AuthService);

  ngAfterViewInit(): void {
    if (!this.authService.user) {
      this.authService.getLoggedInUsuario()?.subscribe();
    }
  }
}
