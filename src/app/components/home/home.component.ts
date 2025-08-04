import { Component } from '@angular/core';
import { ProductosComponent } from "../productos/productos.component";
import { CheckoutComponent } from "../checkout/checkout.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [ProductosComponent, CheckoutComponent]
})
export class HomeComponent { }