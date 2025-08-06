import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { NotificationService } from 'src/app/services/notification.service';
import { SearchCustomerDialogComponent } from '../search-customer-dialog/search-customer-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface CheckoutItem {
  qty: number;
  desc: string;
  price: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [MatIconModule, MatButtonModule, MatToolbarModule, MatListModule]
})
export class CheckoutComponent {

  notificationService = inject(NotificationService);
  readonly dialog = inject(MatDialog);

  items: CheckoutItem[] = [
    { qty: 3, desc: 'Abrelatas Uña Pata 506 Loekemeyer', price: 4500.50 },
    { qty: 3, desc: 'ACCURATO Carnicero+Oficio ceramica TRAMONTINA 24199/090 para cocinero', price: 4500 },
    { qty: 1, desc: 'Aceite de Lino para Madera Doble Cocido Botella x 1 Litro', price: 1000 },
    { qty: 1, desc: 'Aceite de Lino para Madera Doble Cocido Botella x 1 Litro', price: 1000 },
    { qty: 3, desc: 'ACCURATO Carnicero+Oficio ceramica TRAMONTINA 24199/090 para cocinero', price: 4500 },
    { qty: 3, desc: 'Abrelatas Uña Pata 506 Loekemeyer', price: 4500.50 },
    { qty: 2, desc: 'Descripcion de producto 2', price: 2000 },
    { qty: 1, desc: 'Descripcion de producto 4', price: 3000 },
    { qty: 3, desc: 'Descripcion de producto 1', price: 4500 },
    { qty: 1, desc: 'Descripcion de producto 3', price: 1000 },
    { qty: 2, desc: 'Descripcion de producto 2', price: 2000 },
    { qty: 1, desc: 'Descripcion de producto 4', price: 3000 },
    { qty: 3, desc: 'Descripcion de producto 1', price: 4500 },
    { qty: 1, desc: 'Descripcion de producto 3', price: 1000 },
    { qty: 2, desc: 'Descripcion de producto 2', price: 2000 },        
    { qty: 1, desc: 'Descripcion de producto 5', price: 5000 }
  ];

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  removeItem(item: CheckoutItem) {
    this.items = this.items.filter(i => i !== item);
    this.notificationService.openSnackBar("Se quitó " + item.desc + " de la lista", '', 3000);
  }

  finalize() {
    alert('Compra finalizada');
  }

  openDialog() {
    const dialogRef = this.dialog.open(SearchCustomerDialogComponent, { restoreFocus: false });
    dialogRef.afterClosed().subscribe(
      () => this.notificationService.openSnackBar("Cliente seleccionado", '', 3500));
  }
}