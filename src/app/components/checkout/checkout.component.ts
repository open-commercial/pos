import { Component, effect, ElementRef, inject, QueryList, signal, ViewChild, ViewChildren, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
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
import { PaymentMethodService } from '../../services/payment-method.service';
import { FormaDePago } from '../../models/forma-de-pago.model';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';

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
    MatFormFieldModule,
    MatSelectModule,
    DecimalPipe
  ]
})
export class CheckoutComponent implements AfterViewInit {

  readonly $paymentMethods = signal<FormaDePago[]>([]);
  readonly $selectedPaymentMethod = signal<FormaDePago | null>(null);
  readonly $receiptTypes = Object.values(TipoDeComprobante);
  readonly $selectedReceiptType = signal(TipoDeComprobante.TIQUE_PRESUPUESTO);

  notificationService = inject(NotificationService);
  orderService = inject(OrderService);
  customerAccountService = inject(CustomerAccountService);
  branchService = inject(BranchService);
  focusNavigationService = inject(FocusNavigationService);
  paymentMethodService = inject(PaymentMethodService);
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
  @ViewChild('receiptTypeSelect') receiptTypeSelect!: MatSelect;
  @ViewChild('paymentMethodSelect') paymentMethodSelect!: MatSelect;

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
    this.loadPaymentMethods();
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
      setTimeout(() => this.receiptTypeSelect?.focus(), 0);
    } else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.focusNavigationService.requestQtyInputFocus();
    }
  }

  onPaymentMethodKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.checkoutBtn?.nativeElement.focus();
    } else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      const rows = this.checkoutRows.toArray();
      if (rows.length > 0) {
        this.focusCheckoutRow(this.lastFocusedCheckoutIndex);
      } else {
        this.focusNavigationService.requestQtyInputFocus();
      }
    }
  }

  onReceiptTypeKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.paymentMethodSelect?.focus();
    } else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      const rows = this.checkoutRows.toArray();
      if (rows.length > 0) {
        this.focusCheckoutRow(this.lastFocusedCheckoutIndex);
      } else {
        this.focusNavigationService.requestQtyInputFocus();
      }
    }
  }

  onCheckoutBtnKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.receiptTypeSelect?.focus();
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

  loadPaymentMethods() {
    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (paymentMethods) => {
        this.$paymentMethods.set(paymentMethods);
        this.selectDefaultPaymentMethod();
      },
      error: () => {
        this.notificationService.openSnackBar('❌ No se pudo cargar la lista de formas de pago', '', 5000);
      }
    });
  }

  selectDefaultPaymentMethod() {
    const paymentMethods = this.$paymentMethods();
    const defaultPaymentMethod = paymentMethods.find(pm => pm.predeterminado) ?? paymentMethods[0] ?? null;
    this.$selectedPaymentMethod.set(defaultPaymentMethod);
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

    const selectedPaymentMethod = this.$selectedPaymentMethod();
    if (!selectedPaymentMethod) {
      this.notificationService.openSnackBar('❌ Debe seleccionar una forma de pago', '', 5000);
      return;
    }

    const nuevoPedido: NuevoPedido = {
      idSucursal: selectedSucursal.idSucursal,
      observaciones: currentOrder.observaciones ?? '',
      idCliente,
      tipoDeEnvio: currentOrder.tipoDeEnvio ?? TipoDeEnvio.RETIRO_EN_SUCURSAL,
      renglones: currentOrder.renglones ?? [],
      idsFormaDePago: [selectedPaymentMethod.idFormaDePago],
      montos: [this.total()],
      recargoPorcentaje: currentOrder.recargoPorcentaje ?? 0,
      descuentoPorcentaje: currentOrder.descuentoPorcentaje ?? 0
    };

    this.orderService.setUpdatingOrder(true);
    this.orderService.saveOrder(nuevoPedido).subscribe({
      next: () => {
        this.orderService.setUpdatingOrder(false);
        this.orderService.setOrderLines([]);
        this.selectDefaultPaymentMethod();
        this.$selectedReceiptType.set(TipoDeComprobante.TIQUE_PRESUPUESTO);
        this.notificationService.openSnackBar('✅ Pedido guardado!', '', 5000);
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
}
