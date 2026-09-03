import { Component, effect, ElementRef, inject, QueryList, signal, ViewChild, ViewChildren, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
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
import { BranchService } from '../../services/branch.service';
import { LocalStorageKeys, LocalStorageUtil } from '../../utils/local-storage-util';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente-cliente.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RenglonPedido } from '../../models/renglon-pedido.model';
import { NuevoPedido } from '../../models/nuevo-pedido.model';
import { FocusNavigationService } from '../../services/focus-navigation.service';
import { TipoDeEnvio } from '../../models/tipo-de-envio';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    MatProgressSpinnerModule,
    DecimalPipe
  ]
})
export class CheckoutComponent implements AfterViewInit {

  notificationService = inject(NotificationService);
  orderService = inject(OrderService);
  customerAccountService = inject(CustomerAccountService);
  branchService = inject(BranchService);
  focusNavigationService = inject(FocusNavigationService);
  storageService = inject(LocalStorageUtil);
  readonly dialog = inject(MatDialog);
  $customerName = signal('');
  $customerError = signal(false);
  $orderLines = signal<RenglonPedido[]>([]);
  $loading = signal(false);
  lastFocusedCheckoutIndex = 0;
  private pendingRemoveFocus = false;
  @ViewChildren('checkoutRow', { read: ElementRef }) checkoutRows!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('checkoutBtn', { read: ElementRef }) checkoutBtn!: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      const renglones = this.orderService.$newOrder().renglones ?? [];
      if (renglones.length === 0) {
        this.$orderLines.set([]);
        return;
      }
      this.$loading.set(true);
      this.orderService.calculateOrderLines(renglones).subscribe({
        next: (lines) => { this.$orderLines.set(lines); this.$loading.set(false); },
        error: () => { this.$orderLines.set([]); this.$loading.set(false); }
      });
    });

    effect(() => {
      if (this.focusNavigationService.$checkoutRowFocusRequest() > 0) {
        setTimeout(() => this.focusCheckoutRow(this.lastFocusedCheckoutIndex), 0);
      }
    });

    this.loadDefaultCustomer();
  }

  ngAfterViewInit() {
    this.checkoutRows.changes.subscribe(() => {
      if (!this.pendingRemoveFocus || this.$loading() || this.orderService.$updatingOrder()) {
        return;
      }
      this.pendingRemoveFocus = false;
      const rows = this.checkoutRows.toArray();
      if (rows.length > 0) {
        setTimeout(() => this.focusCheckoutRow(this.lastFocusedCheckoutIndex), 0);
      } else {
        this.focusNavigationService.requestQtyInputFocus();
      }
    });
  }

  focusCheckoutRow(index: number) {
    const rows = this.checkoutRows?.toArray() ?? [];
    if (rows.length === 0) {
      this.checkoutBtn?.nativeElement.focus();
      return;
    }
    rows[Math.min(index, rows.length - 1)]?.nativeElement.focus();
  }

  onCheckoutRowKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const rows = this.checkoutRows.toArray();
      const target = event.key === 'ArrowDown' ? rows[index + 1] : rows[index - 1];
      target?.nativeElement.focus();
    } else if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      setTimeout(() => document.querySelector<HTMLElement>('.checkout-btn')?.focus(), 0);
    } else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.focusNavigationService.requestQtyInputFocus();
    }
  }

  onCheckoutBtnKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      const rows = this.checkoutRows.toArray();
      if (rows.length > 0) {
        this.focusCheckoutRow(this.lastFocusedCheckoutIndex);
      } else {
        this.focusNavigationService.requestQtyInputFocus();
      }
    }
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
    return this.$orderLines().reduce((sum, item) => sum + item.importe, 0);
  }

  removeItem(item: RenglonPedido, index: number) {
    this.pendingRemoveFocus = true;
    this.lastFocusedCheckoutIndex = index;
    const renglones = (this.orderService.$newOrder().renglones ?? [])
      .filter(r => r.idProductoItem !== item.idProductoItem);
    this.orderService.setOrderLines(renglones);
    this.notificationService.openSnackBar(`❌ Se quitó "${item.descripcionItem}" de la lista`, '', 3000);
  }

  sendOrder() {
    if (this.$orderLines().length === 0 || this.$loading() || this.orderService.$updatingOrder()) {
      return;
    }

    const storedCustomerAccount = this.storageService.getItem(LocalStorageKeys.CUSTOMER_ACCOUNT) as CuentaCorrienteCliente | null;
    const currentOrder = this.orderService.$newOrder();
    const selectedSucursal = this.branchService.$selectedSucursal();
    const idCliente = storedCustomerAccount?.cliente?.idCliente;

    if (!selectedSucursal || !idCliente) {
      this.notificationService.openSnackBar('❌ No se pudo obtener la sucursal o el cliente del pedido', '', 5000);
      return;
    }

    const nuevoPedido: NuevoPedido = {
      idSucursal: selectedSucursal.idSucursal,
      observaciones: currentOrder.observaciones ?? '',
      idCliente,
      tipoDeEnvio: currentOrder.tipoDeEnvio ?? TipoDeEnvio.RETIRO_EN_SUCURSAL,
      renglones: currentOrder.renglones ?? [],
      idsFormaDePago: currentOrder.idsFormaDePago ?? [],
      montos: currentOrder.montos ?? [],
      recargoPorcentaje: currentOrder.recargoPorcentaje ?? 0,
      descuentoPorcentaje: currentOrder.descuentoPorcentaje ?? 0
    };

    this.orderService.setUpdatingOrder(true);
    this.orderService.saveOrder(nuevoPedido).subscribe({
      next: () => {
        this.orderService.setUpdatingOrder(false);
        this.orderService.setOrderLines([]);
        this.notificationService.openSnackBar('✅ Pedido guardado con éxito', '', 5000);
      },
      error: () => {
        this.orderService.setUpdatingOrder(false);
        this.notificationService.openSnackBar('❌ No se pudo guardar el pedido. Intente nuevamente', '', 5000);
      }
    });
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
