import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import { switchMap } from 'rxjs';
import { Usuario } from 'src/app/models/usuario.model';
import { Producto } from 'src/app/models/producto.model';
import { CantidadEnSucursal } from "src/app/models/cantidad-en-sucursal.model";
import { BusquedaProductoCriteria } from '../../models/busqueda-producto-criteria.model';
import { OrderService } from "../../services/order.service";

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
export class ProductsComponent implements OnInit {

  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  branchService = inject(BranchService);
  productService = inject(ProductService);
  orderService = inject(OrderService);
  dialog = inject(MatDialog);
  router = inject(Router);
  $loading = signal(false);
  $searchCriteria = signal('');
  $products = signal<Producto[]>([]);
  infiniteScrollPage = 0;
  isLastPage = true;
  readonly debounceTimeMs = 500;
  private debounceTimer: any;
  loggedUser!: Usuario | null;
  @ViewChild('productSearchInput') productSearchInput!: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const term = this.$searchCriteria().trim();
      this.infiniteScrollPage = 0;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.searchProducts(term), this.debounceTimeMs);
    });
  }

  ngOnInit(): void {
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
          this.$loading.set(false);
        },
        error: (err) => {
          this.$loading.set(false);
          this.showErrorMessage(err);
        }
      });
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
    if (!value.endsWith('.')) {
      let quantity = Number.parseFloat(value) || 0;

      // Round to max 2 decimals
      quantity = Math.round(quantity * 100) / 100;

      const availableQuantity = this.getAvailableQuantityForSelectedBranch(product);

      // Check if exceeds available quantity
      if (quantity > availableQuantity) {
        input.value = availableQuantity.toString();
      }
    }    

    this.notificationService.openSnackBar(`Cantidad para el producto ${product.descripcion} cambiada.`, '', 1000);
  }

  searchProducts(term: string) {
    this.$loading.set(true);
    const selectedSucursal = this.branchService.$selectedSucursal();
    if (!selectedSucursal) {
      this.$products.set([]);
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
          }
          this.$loading.set(false);
        },
        error: (err) => {
          if (this.infiniteScrollPage > 0) {
            this.infiniteScrollPage -= 1;
          }
          this.$loading.set(false);
          this.showErrorMessage(err);
        }
      });
  }

  getAvailableQuantityForSelectedBranch(p: Producto) {
    const selectedSucursal = this.branchService.$selectedSucursal();
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(c => c.idSucursal === selectedSucursal?.idSucursal);
    return aux.length ? aux[0].cantidad : 0;
  }

  getProductQuantityInOrder(p: Producto) {
    return 0;
  }

  increaseQuantity(p: Producto) { }

  decreaseQuantity(p: Producto) { }

  addOrRemoveProductToOrder(p: Producto) {
    // call pedidoService to calculate new item

    // call storageService to save current order using StorageKeys.PEDIDO

  }

  openSearchBranchDialog() {
    const dialogRef = this.dialog.open(SearchBranchDialogComponent, { restoreFocus: false, disableClose: true });
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

  showErrorMessage(err: any) {
    if (err.status === 0) {
      this.notificationService.openSnackBar(SERVICE_UNAVAILABLE_MESSAGE, '', 3500);
    } else {
      this.notificationService.openSnackBar(err.error, '', 3500);
    }
  }
}
