import { BusquedaProductoCriteria } from '../../models/criteria/busqueda-producto-criteria';
import { Component, effect, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Producto } from 'src/app/models/producto';
import { CantidadEnSucursal } from "src/app/models/cantidad-en-sucursal";
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
import { Usuario } from 'src/app/models/usuario';

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
  sucursalService = inject(SucursalService);
  productoService = inject(ProductoService);
  dialog = inject(MatDialog);
  router = inject(Router);
  $loading = signal(false);
  $searchCriteria = signal('');
  infiniteScrollPage = 0;
  isLastPage = true;
  readonly debounceTimeMs = 400;
  $products = signal<Producto[]>([]);
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
          return this.sucursalService.getSucursalById(u.idSucursalPredeterminada);
        })
      )
      .subscribe({
        next: (s) => {
          this.sucursalService.$selectedSucursal.set(s);
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

  @HostListener('scroll', ['$event'])
  public onProductsScroll(event: Event) {
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

  searchProducts(term: string) {
    this.$loading.set(true);
    const selectedSucursal = this.sucursalService.$selectedSucursal();
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
    this.productoService.search(criteria, selectedSucursal.idSucursal)
      .subscribe({
        next: (data) => {
          this.$products.set(this.$products().concat(data.content));
          this.isLastPage = data.last;
          setTimeout(() => this.productSearchInput.nativeElement.focus(), 0);
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
    const selectedSucursal = this.sucursalService.$selectedSucursal();
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(c => c.idSucursal === selectedSucursal?.idSucursal);
    return aux.length ? aux[0].cantidad : 0;
  }

  increaseQuantity(product: Producto) { }

  decreaseQuantity(product: Producto) { }

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
