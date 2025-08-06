import { Component } from '@angular/core';
import { ProductsComponent } from "../products/products.component";
import { CheckoutComponent } from "../checkout/checkout.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [ProductsComponent, CheckoutComponent]
})
export class HomeComponent { }