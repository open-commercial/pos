import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Sucursal } from 'src/app/models/sucursal.model';
import { AuthService, SERVICE_UNAVAILABLE_MESSAGE } from 'src/app/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from 'src/app/services/notification.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-search-branch-dialog',
  templateUrl: './search-branch-dialog.component.html',
  styleUrls: ['./search-branch-dialog.component.scss'],
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
})
export class SearchBranchDialogComponent implements OnInit {

  sucursalService = inject(SucursalService);
  authService = inject(AuthService);
  usuarioService = inject(UsuarioService);
  notificationService = inject(NotificationService);
  $sucursales = signal<Sucursal[]>([]);
  $selectedSucursalId = signal<number>(0);
  $loading = signal(false);
  dialogRef = inject(MatDialogRef<SearchBranchDialogComponent>);

  ngOnInit(): void {
    this.$loading.set(true);
    this.authService.getLoggedUser()
      .pipe(
        switchMap(u => {
          this.$selectedSucursalId.set(u.idSucursalPredeterminada);
          return this.sucursalService.getSucursales()
        }))
      .subscribe({
        next: (sucursales) => {
          this.$sucursales.set(sucursales);
          this.$loading.set(false);
        },
        error: (err) => {
          this.$loading.set(false);
          this.showErrorMessage(err);
          this.dialogRef.close();
        }
      });
  }

  selectSucursalAsDefault(selectedSucursal: Sucursal) {
    this.$loading.set(true);
    this.authService.getLoggedUser()
      .pipe(
        switchMap(u => this.usuarioService.setSucursalDefault(u.idUsuario, selectedSucursal.idSucursal)
        ))
      .subscribe({
        next: () => {
          this.sucursalService.$selectedSucursal.set(selectedSucursal);
          this.$loading.set(false);
          this.dialogRef.close(selectedSucursal.nombre);
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
