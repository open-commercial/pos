import { Subject, debounceTime, finalize } from 'rxjs';
import { BusquedaProductoCriteria } from './../../models/criteria/busqueda-producto-criteria';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { LoadingOverlayService } from 'src/app/services/loading-overlay.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Producto } from 'src/app/models/producto';

const PRODUCTOS_INPUT_TEXT_KEY = 'productosInputText';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit, OnDestroy {
  infinteSrollPage = 0;
  isLastPage = true;

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 500;
  inputText = sessionStorage.getItem(PRODUCTOS_INPUT_TEXT_KEY) ?? '';
  fetching = false;

  productos: Producto[] = [];

  @HostListener('document:scroll', ['$event'])
  public onViewportScroll() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (window.scrollY >= scrollableHeight) {
        //console.log('User has scrolled to the bottom of the page!')
        if (!this.isLastPage) {
          this.infinteSrollPage += 1;
          this.getProductos(this.inputText);
        }
    }
  }

  constructor(private sucursalService: SucursalService,
              private productoService: ProductoService,
              private loadingOverlayService: LoadingOverlayService){}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(this.debounceTimeMs))
      .subscribe((searchTerm) => {
        this.infinteSrollPage = 0;
        this.getProductos(searchTerm);
      })
    ;
    this.sucursalService.selectedSucursalId$.subscribe(() => {
      this.getProductos(this.inputText);
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  search() {
    sessionStorage.setItem(PRODUCTOS_INPUT_TEXT_KEY, this.inputText);
    this.searchSubject.next(this.inputText);
  }

  getProductos(searchTerm: string = '') {
    const sucursalId = this.sucursalService.selectedSucursalId;

    if (sucursalId) {
      const criteria: BusquedaProductoCriteria = {
        pagina: this.infinteSrollPage,
        codigo: searchTerm,
        descripcion: searchTerm,
        ordenarPor: ['descripcion'],
        sentido: 'ASC'
      };
      if (this.infinteSrollPage === 0) {
        this.productos = [];
      }
      this.fetching = true;
      this.productoService.getProductos(criteria, sucursalId)
        .pipe(finalize(() => this.fetching = false))
        .subscribe({
          next: data => {
            this.productos = this.productos.concat(data.content);
            this.isLastPage = data.last;
          },
          error: err => alert(err.error),
        })
      ;
    }
  }
}

