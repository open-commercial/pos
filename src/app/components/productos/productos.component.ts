import { debounce, finalize, fromEvent, of, timer } from 'rxjs';
import { BusquedaProductoCriteria } from './../../models/criteria/busqueda-producto-criteria';
import { AfterViewInit, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { LoadingOverlayService } from 'src/app/services/loading-overlay.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Producto } from 'src/app/models/producto';
import { CantidadEnSucursal } from "src/app/models/cantidad-en-sucursal";
import { DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

const PRODUCTOS_INPUT_TEXT_KEY = 'productosInputText';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
  imports: [DecimalPipe, FontAwesomeModule]
})
export class ProductosComponent implements OnInit, AfterViewInit {

  icons = {
    magnifyingGlass: faMagnifyingGlass,
    xMark: faXmark
  }
  sucursalService = inject(SucursalService);
  productoService = inject(ProductoService);
  loadingOverlayService = inject(LoadingOverlayService);
  infiniteSrollPage = 0;
  isLastPage = true;
  private readonly debounceTimeMs = 750;
  inputText = sessionStorage.getItem(PRODUCTOS_INPUT_TEXT_KEY) ?? '';
  productos: Producto[] = [];
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement> | undefined;

  ngOnInit(): void {
    this.sucursalService.selectedSucursalId$.subscribe(() => {
      this.search(this.inputText);
    });
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
}

