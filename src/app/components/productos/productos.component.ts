import { debounce, finalize, fromEvent, of, timer } from 'rxjs';
import { BusquedaProductoCriteria } from './../../models/criteria/busqueda-producto-criteria';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
export class ProductosComponent implements OnInit, AfterViewInit {
  infinteSrollPage = 0;
  isLastPage = true;

  private readonly debounceTimeMs = 750;
  inputText = sessionStorage.getItem(PRODUCTOS_INPUT_TEXT_KEY) ?? '';

  productos: Producto[] = [];

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>|undefined;

  @HostListener('document:scroll', ['$event'])
  public onViewportScroll() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= scrollableHeight) {
        if (!this.isLastPage) {
          this.infinteSrollPage += 1;
          this.getProductos();
        }
    }
  }

  constructor(private sucursalService: SucursalService,
              private productoService: ProductoService,
              private loadingOverlayService: LoadingOverlayService){}

  ngOnInit(): void {
    this.sucursalService.selectedSucursalId$.subscribe(() => {
      this.search(this.inputText);
    });
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
        })
      ;
      this.searchInput.nativeElement.value = this.inputText;
    }
  }

  private search(searchTerm: string) {
    sessionStorage.setItem(PRODUCTOS_INPUT_TEXT_KEY, searchTerm);
    this.inputText = searchTerm;
    this.infinteSrollPage = 0;
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
        pagina: this.infinteSrollPage,
        codigo: this.inputText,
        descripcion: this.inputText,
        ordenarPor: ['descripcion'],
        sentido: 'ASC'
      };
      if (this.infinteSrollPage === 0) {
        this.productos = [];
      }
      this.loadingOverlayService.activate();
      this.productoService.getProductos(criteria, sucursalId)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
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

