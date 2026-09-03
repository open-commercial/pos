import { Component, effect, ElementRef, inject, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { BranchService } from 'src/app/services/branch.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AuthService, SERVICE_UNAVAILABLE_MESSAGE } from 'src/app/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchBranchDialogComponent } from '../search-branch-dialog/search-branch-dialog.component';
import { NotificationService } from 'src/app/services/notification.service';
import { Router } from '@angular/router';
import { map, switchMap, throwError } from 'rxjs';
import { Usuario } from 'src/app/models/usuario.model';
import { Producto } from 'src/app/models/producto.model';
import { CantidadEnSucursal } from "src/app/models/cantidad-en-sucursal.model";
import { BusquedaProductoCriteria } from '../../models/busqueda-producto-criteria.model';
import { OrderService } from "../../services/order.service";
import { FocusNavigationService } from '../../services/focus-navigation.service';
import { NuevoRenglonPedido } from '../../models/nuevo-renglon-pedido.model';
import { NuevosResultadosPedido } from '../../models/nuevos-resultados-pedido.model';
import { ProductoFaltante } from '../../models/producto-faltante.model';
import { ProductosParaVerificarStock } from '../../models/productos-para-verificar-stock.model';
import { RenglonPedido } from '../../models/renglon-pedido.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  imports: [
    DecimalPipe,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatRippleModule,
    MatProgressSpinnerModule
  ]
})
export class ProductsComponent {

  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  branchService = inject(BranchService);
  productService = inject(ProductService);
  orderService = inject(OrderService);
  focusNavigationService = inject(FocusNavigationService);
  dialog = inject(MatDialog);
  router = inject(Router);
  $loading = signal(false);
  $searchCriteria = signal('');
  $products = signal<Producto[]>([]);
  infiniteScrollPage = 0;
  isLastPage = true;
  lastFocusedQtyIndex = 0;
  readonly debounceTimeMs = 500;
  private debounceTimer: any;
  loggedUser!: Usuario | null;
  @ViewChild('productSearchInput') productSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('qtyInput') qtyInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor() {
    effect(() => {
      const term = this.$searchCriteria().trim();
      this.infiniteScrollPage = 0;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.searchProducts(term), this.debounceTimeMs);
    });

    effect(() => {
      if (this.focusNavigationService.$qtyInputFocusRequest() > 0) {
        setTimeout(() => this.focusQtyInput(this.lastFocusedQtyIndex), 0);
      }
    });

    this.loadSelectedBranch();
  }

  focusQtyInput(index: number) {
    const inputs = this.qtyInputs?.toArray() ?? [];
    if (inputs.length === 0) return;
    const target = inputs[Math.min(index, inputs.length - 1)];
    target?.nativeElement.focus({ preventScroll: false });
  }

  clearSearch() {
    this.infiniteScrollPage = 0;
    this.productSearchInput.nativeElement.value = '';
    this.$searchCriteria.set('');
  }

  onProductsScroll(event: Event) {
    if (this.$loading() || this.isLastPage) return;
    const element = event.target as HTMLElement;
    const scrollableHeight = element.scrollHeight - window.innerHeight;
    if (element.scrollTop >= scrollableHeight) {
      if (!this.isLastPage) {
        this.infiniteScrollPage += 1;
        this.searchProducts(this.$searchCriteria());
      }
    }
  }

  formatQuantity(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.trim();

    // Normalize comma to dot
    if (value.includes(',')) {
      value = value.replaceAll(',', '.');
    }

    // If value ends with a decimal separator (dot) remove it
    if (value.endsWith('.')) {
      value = value.slice(0, -1);
    }

    // Remove leading zeros from integer part
    if (value.includes('.')) {
      const parts = value.split('.');
      const intPart = parts[0].replace(/^0+/, '');
      const decPart = parts[1] || '';
      if (/^0*$/.test(decPart)) {
        // decimal part is all zeros -> collapse
        value = intPart === '' ? '0' : intPart;
      } else {
        // remove leading zeros from integer part but keep decimal
        parts[0] = intPart === '' ? '0' : intPart;
        value = parts.join('.');
      }
    } else {
      // no decimal part: remove leading zeros, but leave single zero
      value = value.replace(/^0+/, '');
      if (value === '') value = '0';
    }

    input.value = value;
  }

  onQuantityChange(product: Producto, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // If empty, reset to 0
    if (value === '') {
      input.value = '0';
      return;
    }

    // Limit to 2 decimal places (but allow typing the dot)
    const dotIndex = value.indexOf('.');
    if (dotIndex !== -1 && value.length > dotIndex + 3) {
      value = value.substring(0, dotIndex + 3);
      input.value = value;
    }

    // Only validate if not ending with a dot (user is still typing decimal)
    if (value.endsWith('.')) {
      return;
    }

    let quantity = Number.parseFloat(value) || 0;

    // Round to max 2 decimals
    quantity = Math.round(quantity * 100) / 100;

    const availableQuantity = this.getAvailableQuantityForSelectedBranch(product);

    // Check if exceeds available quantity
    if (quantity > availableQuantity) {
      quantity = availableQuantity;
      input.value = availableQuantity.toString();
    }

    this.updateOrderWithQuantity(product, quantity, input);
  }

  getAvailableQuantityForSelectedBranch(p: Producto) {
    const selectedSucursal = this.branchService.$selectedSucursal();
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(c => c.idSucursal === selectedSucursal?.idSucursal);
    return aux.length ? aux[0].cantidad : 0;
  }

  getProductQuantityInOrder(p: Producto) {
    const renglones = this.orderService.$newOrder().renglones ?? [];
    const line = renglones.find(r => r.idProductoItem === p.idProducto);
    return line ? line.cantidad : 0;
  }

  onSearchKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.focusQtyInput(this.lastFocusedQtyIndex);
    }
  }

  onQuantityKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const product = this.$products()[index];
    const inputs = this.qtyInputs.toArray();

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.decreaseQuantity(product, input);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.increaseQuantity(product, input);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (event.key === 'ArrowUp' && index === 0) {
        return;
      }
      const target = event.key === 'ArrowDown' ? inputs[index + 1] : inputs[index - 1];
      target?.nativeElement.focus();
    } else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      setTimeout(() => {
        this.productSearchInput.nativeElement.focus();
        this.productSearchInput.nativeElement.select();
      }, 0);
    } else if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.focusNavigationService.requestCheckoutRowFocus();
    }
  }

  increaseQuantity(p: Producto, input: HTMLInputElement) {
    const current = this.getProductQuantityInOrder(p);
    const available = this.getAvailableQuantityForSelectedBranch(p);
    const next = Math.min(current + 1, available);
    if (next === current) return;
    input.value = next.toString();
    this.updateOrderWithQuantity(p, next, input);
  }

  decreaseQuantity(p: Producto, input: HTMLInputElement) {
    const current = this.getProductQuantityInOrder(p);
    const next = Math.max(current - 1, 0);
    if (next === current) return;
    input.value = next.toString();
    this.updateOrderWithQuantity(p, next, input);
  }

  openSearchBranchDialog() {
    const dialogRef = this.dialog.open(SearchBranchDialogComponent, { restoreFocus: false });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.openSnackBar("Sucursal seleccionada: " + result, '', 3500);
        this.infiniteScrollPage = 0;
        this.searchProducts(this.$searchCriteria());
      }
    });
  }

  logout() {
    this.$loading.set(true);
    this.authService.logout().subscribe({
      next: () => {
        this.$loading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.$loading.set(false);
        this.showErrorMessage(err);
      }
    });
  }

  private loadSelectedBranch() {
    this.$loading.set(true);
    this.authService.getLoggedUser()
      .pipe(
        switchMap(u => {
          this.loggedUser = u;
          return this.branchService.getBranchById(u.idSucursalPredeterminada);
        })
      )
      .subscribe({
        next: (s) => {
          this.branchService.$selectedSucursal.set(s);
          this.infiniteScrollPage = 0;
          this.searchProducts(this.$searchCriteria().trim());
        },
        error: (err) => {
          this.$loading.set(false);
          this.showErrorMessage(err);
        }
      });
  }

  private updateOrderWithQuantity(product: Producto, quantity: number, input: HTMLInputElement) {
    const selectedSucursal = this.branchService.$selectedSucursal();
    if (!selectedSucursal) {
      return;
    }

    const currentOrder = this.orderService.$newOrder();
    const renglones: NuevoRenglonPedido[] = (currentOrder.renglones ?? [])
      .filter(r => r.idProductoItem !== product.idProducto);
    if (quantity > 0) {
      renglones.push({ idProductoItem: product.idProducto, cantidad: quantity });
    }

    const stockPayload: ProductosParaVerificarStock = {
      idSucursal: selectedSucursal.idSucursal,
      idProducto: renglones.map(r => r.idProductoItem),
      cantidad: renglones.map(r => r.cantidad)
    };

    this.orderService.setUpdatingOrder(true);
    this.productService.checkStockAvailability(stockPayload)
      .pipe(
        switchMap((outOfStockItems: ProductoFaltante[]) => {
          if (outOfStockItems.length > 0) {
            return throwError(() => ({ faltantes: outOfStockItems }));
          }
          return this.orderService.calculateOrderLines(renglones);
        }),
        switchMap((orderLines: RenglonPedido[]) => {
          const newOrderSummary: NuevosResultadosPedido = {
            importe: orderLines.map(l => l.importe),
            ivaPorcentajes: orderLines.map(() => 0),
            ivaNetos: orderLines.map(() => 0),
            cantidades: orderLines.map(l => l.cantidad),
            descuentoPorcentaje: currentOrder.descuentoPorcentaje ?? 0,
            recargoPorcentaje: currentOrder.recargoPorcentaje ?? 0
          };
          return this.orderService.calculateOrderSummary(newOrderSummary)
            .pipe(map(orderSummaryResults => ({ lineas: orderLines, resultados: orderSummaryResults })));
        })
      )
      .subscribe({
        next: () => {
          this.orderService.setOrderLines(renglones);
          this.orderService.setUpdatingOrder(false);
          setTimeout(() => input.focus(), 0);
        },
        error: (err) => {
          this.orderService.setUpdatingOrder(false);
          input.value = this.getProductQuantityInOrder(product).toString();
          setTimeout(() => input.focus(), 0);
          if (err?.faltantes) {
            const descripciones = err.faltantes.map((f: ProductoFaltante) => f.descripcion).join(', ');
            this.notificationService.openSnackBar(`Sin stock disponible: ${descripciones}`, '', 3500);
          } else {
            this.showErrorMessage(err);
          }
        }
      });
  }

  private searchProducts(term: string) {
    const hadQtyInputFocus = document.activeElement instanceof HTMLElement
      && document.activeElement.classList.contains('quantity-input');
    this.$loading.set(true);
    const selectedSucursal = this.branchService.$selectedSucursal();
    if (!selectedSucursal) {
      this.$products.set([]);
      this.$loading.set(false);
      return;
    }
    const criteria: BusquedaProductoCriteria = {
      pagina: this.infiniteScrollPage,
      codigo: term,
      descripcion: term,
      ordenarPor: ['descripcion'],
      sentido: 'ASC'
    };
    if (this.infiniteScrollPage === 0) {
      this.$products.set([]);
    }
    this.productService.search(criteria, selectedSucursal.idSucursal)
      .subscribe({
        next: (data) => {
          this.$products.set(this.$products().concat(data.content));
          this.isLastPage = data.last;
          if (this.infiniteScrollPage === 0) {
            setTimeout(() => this.productSearchInput.nativeElement.focus(), 0);
          } else if (hadQtyInputFocus) {
            setTimeout(() => this.focusQtyInput(this.lastFocusedQtyIndex), 0);
          }
          this.$loading.set(false);
        },
        error: (err) => {
          if (this.infiniteScrollPage > 0) {
            this.infiniteScrollPage -= 1;
          }
          this.$loading.set(false);
          if (hadQtyInputFocus) {
            setTimeout(() => this.focusQtyInput(this.lastFocusedQtyIndex), 0);
          }
          this.showErrorMessage(err);
        }
      });
  }

  private addOrRemoveProductToOrder(p: Producto) {
    // call pedidoService to calculate new item

    // call storageService to save current order using StorageKeys.PEDIDO

  }

  private showErrorMessage(err: any) {
    if (err.status === 0) {
      this.notificationService.openSnackBar(SERVICE_UNAVAILABLE_MESSAGE, '', 3500);
    } else {
      this.notificationService.openSnackBar(err.error, '', 3500);
    }
  }
}
