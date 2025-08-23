import { debounce, finalize, fromEvent, of, Subscription, timer } from 'rxjs';
import { BusquedaProductoCriteria } from '../../models/criteria/busqueda-producto-criteria';
import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Producto } from 'src/app/models/producto';
import { CantidadEnSucursal } from "src/app/models/cantidad-en-sucursal";
import { CommonModule, DecimalPipe } from '@angular/common';
import { Usuario } from 'src/app/models/usuario';
import { Sucursal } from 'src/app/models/sucursal';
import { AuthService } from 'src/app/services/auth.service';
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
import { GlobalMenuDialogComponent } from '../global-menu-dialog/global-menu-dialog.component';
import { NotificationService } from 'src/app/services/notification.service';

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
export class ProductsComponent implements OnInit, OnDestroy, AfterViewInit {
  
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  sucursalService = inject(SucursalService);
  productoService = inject(ProductoService);
  loadingService = inject(LoadingService);
  dialog = inject(MatDialog);
  searchCriteria = '';
  infiniteSrollPage = 0;
  isLastPage = true;
  private readonly debounceTimeMs = 750;
  products: Producto[] = [];
  sucursales: Sucursal[] = [];
  usuario: Usuario | null = null;
  selectedSucursal: Sucursal | null = null;
  private readonly usuarioSeleccionadoSubscription = new Subscription();
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement> | undefined;

  increaseQuantity(producto: Producto) { }

  decreaseQuantity(producto: Producto) { }

  openGlobalMenuDialog() {
    const dialogRef = this.dialog.open(GlobalMenuDialogComponent, {restoreFocus: false});
    dialogRef.afterClosed().subscribe(() => this.notificationService.openSnackBar("Sucursal seleccionada", '', 3500));
  }

  ngOnInit(): void {
    this.loadingService.activate();
    this.sucursalService.getSucursales()
      //.pipe(finalize(() => this.loadingService.deactivate()))
      .subscribe({
        next: sucursales => {
          this.sucursales = sucursales;
          const s: Sucursal | null | undefined = null;
          if (this.sucursales.length) {
            let s = this.sucursales.find(s => s.idSucursal === this.sucursalService.selectedSucursalId);
            this.selectSucursal(s ?? sucursales[0]);
          }
        },
        error: err => alert(err.error),
      });
    this.usuarioSeleccionadoSubscription.add(this.authService.user$.subscribe(u => {
      this.usuario = u;
    }));
    this.sucursalService.selectedSucursalId$.subscribe(() => {
      this.search(this.searchCriteria);
    });
  }

  ngOnDestroy(): void {
    this.usuarioSeleccionadoSubscription.unsubscribe();
  }

  @HostListener('document:scroll', ['$event'])
  public onViewportScroll() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= scrollableHeight) {
      if (!this.isLastPage) {
        this.infiniteSrollPage += 1;
        this.getProductos();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.searchInput) {
      fromEvent(this.searchInput.nativeElement, 'keyup')
        .pipe(debounce(e => {
          return (e as KeyboardEvent).key !== 'Enter' ? timer(this.debounceTimeMs) : of({});
        }))
        .subscribe(() => {
          const searchTerm = this.searchInput?.nativeElement.value ?? '';
          this.search(searchTerm);
        });
      this.searchInput.nativeElement.value = this.searchCriteria;
    }
  }

  private search(searchTerm: string) {
    this.searchCriteria = searchTerm;
    this.infiniteSrollPage = 0;
    this.getProductos();
  }

  getProductos() {
    const sucursalId = this.sucursalService.selectedSucursalId;
    if (sucursalId) {
      const criteria: BusquedaProductoCriteria = {
        pagina: this.infiniteSrollPage,
        codigo: this.searchCriteria,
        descripcion: this.searchCriteria,
        ordenarPor: ['descripcion'],
        sentido: 'ASC'
      };
      if (this.infiniteSrollPage === 0) {
        this.products = [];
      }
      this.loadingService.activate();
      this.productoService.buscar(criteria, sucursalId)
        .pipe(finalize(() => this.loadingService.deactivate()))
        .subscribe({
          next: data => {
            this.products = this.products.concat(data.content);
            this.isLastPage = data.last;
          },
          error: err => alert(err.error),
        });
    }
  }

  getCantidadDisponibleDeSurcusalSelecionada(p: Producto) {
    const sucursalId = this.sucursalService.selectedSucursalId;
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(c => c.idSucursal === sucursalId);
    return aux.length ? aux[0].cantidad : 0;
  }

  logout() {
    this.authService.logout(
      () => this.loadingService.activate(),
      null,
      () => { alert('Error al salir') },
      () => this.loadingService.deactivate()
    );
  }

  selectSucursal(s: Sucursal) {
    this.selectedSucursal = s;
    if (s.idSucursal) {
      this.sucursalService.selectedSucursalId = s.idSucursal;
    }
  }
}

