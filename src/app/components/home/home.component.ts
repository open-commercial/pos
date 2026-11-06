import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ProductsComponent } from "../products/products.component";
import { CheckoutComponent } from "../checkout/checkout.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ProductsComponent, CheckoutComponent]
})
export class HomeComponent { }