import { SucursalService } from './../../services/sucursal.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { Sucursal } from 'src/app/models/sucursal';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingOverlayService } from 'src/app/services/loading-overlay.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  usuario: Usuario|null = null;
  isCollapsed = false;
  sucursales: Sucursal[] = [];
  selectedSucursal: Sucursal|null = null;

  private subscription = new Subscription();

  constructor(private authService: AuthService,
              private loadingOverlayService: LoadingOverlayService,
              private sucursalService: SucursalService) {}

  ngOnInit(): void {
    this.loadingOverlayService.activate();
    this.sucursalService.getSucursales()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: sucursales => {
          this.sucursales = sucursales;
          const s: Sucursal|null|undefined = null;
          if (this.sucursales.length) {
            let s = this.sucursales.find(s => s.idSucursal === this.sucursalService.selectedSucursalId);
            this.selectSucursal(s ?? sucursales[0]);
          }
        },
        error: err => alert(err.error),
      })
    ;
    this.subscription.add(this.authService.user$.subscribe(u => {
      this.usuario = u;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
