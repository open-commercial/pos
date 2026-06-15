import { Component, effect, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { NotificationService } from 'src/app/services/notification.service';
import { SearchCustomerDialogComponent } from '../search-customer-dialog/search-customer-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { CustomerAccountService } from '../../services/customer-account.service';
import { LocalStorageKeys, LocalStorageUtil } from '../../utils/local-storage-util';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente-cliente.model';

interface CheckoutItem {
  qty: number;
  desc: string;
  price: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    DecimalPipe
  ]
})
export class CheckoutComponent {

  notificationService = inject(NotificationService);
  orderService = inject(OrderService);
  customerAccountService = inject(CustomerAccountService);
  storageService = inject(LocalStorageUtil);
  readonly dialog = inject(MatDialog);
  $customerName = signal('');
  $customerError = signal(false);
  
  items: CheckoutItem[] = [
    {qty: 3, desc: 'Abrelatas Uña Pata 506 Loekemeyer', price: 4500.50},
    {qty: 3, desc: 'ACCURATO Carnicero+Oficio ceramica TRAMONTINA 24199/090 para cocinero', price: 4500},
    {qty: 1, desc: 'Aceite de Lino para Madera Doble Cocido Botella x 1 Litro', price: 1000},
    {qty: 1, desc: 'Aceite de Lino para Madera Doble Cocido Botella x 1 Litro', price: 1000},
    {qty: 3, desc: 'ACCURATO Carnicero+Oficio ceramica TRAMONTINA 24199/090 para cocinero', price: 4500},
    {qty: 3, desc: 'Abrelatas Uña Pata 506 Loekemeyer', price: 4500.50},
    {qty: 2, desc: 'Descripcion de producto 2', price: 2000},
    {qty: 1, desc: 'Descripcion de producto 4', price: 300.50},
    {qty: 3, desc: 'Descripcion de producto 1', price: 4500},
    {qty: 1, desc: 'Descripcion de producto 3', price: 1000},
    {qty: 2, desc: 'Descripcion de producto 2', price: 2000},
    {qty: 1, desc: 'Descripcion de producto 4', price: 3000},
    {qty: 3, desc: 'Descripcion de producto 1', price: 4500},
    {qty: 1, desc: 'Descripcion de producto 3', price: 1000},
    {qty: 2, desc: 'Descripcion de producto 2', price: 2000},
    {qty: 1, desc: 'Descripcion de producto 5', price: 5000}
  ];

  constructor() {
    effect(() => {
      console.log(this.orderService.$newOrder());
    });

    this.loadDefaultCustomer();
  }

  loadDefaultCustomer() {
    const storedCustomerAccount = this.storageService.getItem(LocalStorageKeys.CUSTOMER_ACCOUNT) as CuentaCorrienteCliente | null;

    if (storedCustomerAccount?.cliente?.nombreFiscal) {
      this.$customerError.set(false);
      this.$customerName.set(storedCustomerAccount.cliente.nombreFiscal);
      return;
    }

    this.customerAccountService.getDefaultCustomerAccount().subscribe({
      next: (customerAccount) => {
        this.storageService.setItem(LocalStorageKeys.CUSTOMER_ACCOUNT, customerAccount);
        this.$customerError.set(false);
        this.$customerName.set(customerAccount.cliente?.nombreFiscal ?? '');
      },
      error: () => {
        this.$customerError.set(true);
      }
    });
  }

  total(): number {
    return this.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  addItem() {
    this.items.push({qty: 1, desc: 'Nuevo producto', price: 1000});
    this.notificationService.openSnackBar('✅ Se agregó "Nuevo producto" a la lista', '', 3000);
  }

  removeItem(item: CheckoutItem) {
    this.items = this.items.filter(i => i !== item);
    this.notificationService.openSnackBar("❌ Se quitó \"" + item.desc + "\" de la lista", '', 3000);
  }

  finalize() {
    alert('Compra finalizada');
  }

  openSearchCustomerDialog() {
    const dialogRef = this.dialog.open(SearchCustomerDialogComponent, { restoreFocus: false });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.$customerName.set(result);
        this.notificationService.openSnackBar("✅ Cliente seleccionado: " + result, '', 5000);
      }
    });
  }

  /*
  getNuevoPedido() {
    let te: TipoDeEnvio;

    if (this.form.get('opcionEnvio').value === OpcionEnvio.RETIRO_EN_SUCURSAL) {
      te = TipoDeEnvio.RETIRO_EN_SUCURSAL;
    } else {
      const opcionEnvioUbicacion = this.form.get('opcionEnvioUbicacion').value;
      te = opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION ?
        TipoDeEnvio.USAR_UBICACION_FACTURACION : TipoDeEnvio.USAR_UBICACION_ENVIO;
    }

    const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;
    const renglones = this.form.get('renglonesPedido').value && this.form.get('renglonesPedido').value.length
      ? this.form.get('renglonesPedido').value : [];

    const resultados: Resultados = this.form.get('resultados').value ? this.form.get('resultados').value : null;

    return {
      idPedido: this.form.get('idPedido').value,
      observaciones: this.form.get('observaciones').value,
      idSucursal: this.sucursalesService.getIdSucursal(),
      tipoDeEnvio: te,
      idCliente: ccc && ccc.cliente ? ccc.cliente.idCliente : null,
      renglones: renglones.map(r => {
        return {
          idProductoItem: r.renglonPedido.idProductoItem,
          cantidad: r.renglonPedido.cantidad,
        };
      }),
      idsFormaDePago: this.form.get('pagos').value.map((e) => Number(e.idFormaDePago)),
      montos: this.form.get('pagos').value.map((e) => e.monto),
      recargoPorcentaje: resultados && resultados.recargoPorcentaje ? resultados.recargoPorcentaje : 0,
      descuentoPorcentaje: resultados && resultados.descuentoPorcentaje ? resultados.descuentoPorcentaje : 0,
    };
  }
  */
}
