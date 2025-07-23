import { debounce, finalize, fromEvent, of, Subscription, timer } from 'rxjs';
import { BusquedaProductoCriteria } from './../../models/criteria/busqueda-producto-criteria';
import { AfterViewInit, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { LoadingOverlayService } from 'src/app/services/loading-overlay.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Producto } from 'src/app/models/producto';
import { CantidadEnSucursal } from "src/app/models/cantidad-en-sucursal";
import { CommonModule, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark, faUser, faStore, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Usuario } from 'src/app/models/usuario';
import { Sucursal } from 'src/app/models/sucursal';
import { AuthService } from 'src/app/services/auth.service';
import { RouterLink } from '@angular/router';

const PRODUCTOS_INPUT_TEXT_KEY = 'productosInputText';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
  imports: [
    DecimalPipe,
    FontAwesomeModule,
    CommonModule,
    RouterLink
  ]
})
export class ProductosComponent implements OnInit, AfterViewInit {

  icons = {
    magnifyingGlass: faMagnifyingGlass,
    xMark: faXmark,
    user: faUser,
    store: faStore,
    rightFromBracket: faRightFromBracket
  }
  authService = inject(AuthService);
  sucursalService = inject(SucursalService);
  productoService = inject(ProductoService);
  loadingOverlayService = inject(LoadingOverlayService);
  infiniteSrollPage = 0;
  isLastPage = true;
  private readonly debounceTimeMs = 750;
  inputText = sessionStorage.getItem(PRODUCTOS_INPUT_TEXT_KEY) ?? '';
  productos: Producto[] = [];
  sucursales: Sucursal[] = [];
  usuario: Usuario | null = null;
  selectedSucursal: Sucursal | null = null;
  private readonly usuarioSeleccionadoSubscription = new Subscription();
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement> | undefined;

  ngOnInit(): void {
    this.loadingOverlayService.activate();
    this.sucursalService.getSucursales()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
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
      this.search(this.inputText);
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
      this.searchInput.nativeElement.value = this.inputText;
    }
  }

  private search(searchTerm: string) {
    sessionStorage.setItem(PRODUCTOS_INPUT_TEXT_KEY, searchTerm);
    this.inputText = searchTerm;
    this.infiniteSrollPage = 0;
    this.getProductos();
  }

  clearInput() {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.search('');
    }
  }

  getProductos() {
    const sucursalId = this.sucursalService.selectedSucursalId;
    if (sucursalId) {
      const criteria: BusquedaProductoCriteria = {
        pagina: this.infiniteSrollPage,
        codigo: this.inputText,
        descripcion: this.inputText,
        ordenarPor: ['descripcion'],
        sentido: 'ASC'
      };
      if (this.infiniteSrollPage === 0) {
        this.productos = [];
      }
      this.loadingOverlayService.activate();
      this.productoService.buscar(criteria, sucursalId)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: data => {
            this.productos = this.productos.concat(data.content);
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
      () => this.loadingOverlayService.activate(),
      null,
      () => { alert('Error al salir') },
      () => this.loadingOverlayService.deactivate()
    );
  }

  selectSucursal(s: Sucursal) {
    this.selectedSucursal = s;
    if (s.idSucursal) {
      this.sucursalService.selectedSucursalId = s.idSucursal;
    }
  }
}

