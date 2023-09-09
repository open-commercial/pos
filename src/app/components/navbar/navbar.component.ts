import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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

  private subscription = new Subscription();

  constructor(private authService: AuthService,
              private loadingOverlayService: LoadingOverlayService) {}

  ngOnInit(): void {
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
}
