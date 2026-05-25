import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { BranchService } from 'src/app/services/branch.service';
import { Sucursal } from 'src/app/models/sucursal.model';
import { AuthService, SERVICE_UNAVAILABLE_MESSAGE } from 'src/app/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
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
    MatProgressSpinnerModule,
    MatDialogModule
  ],
})
export class SearchBranchDialogComponent implements OnInit {

  branchService = inject(BranchService);
  authService = inject(AuthService);
  userService = inject(UserService);
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
          return this.branchService.getBranches()
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
        switchMap(u => this.userService.setDefaultBranch(u.idUsuario, selectedSucursal.idSucursal)
        ))
      .subscribe({
        next: () => {
          this.branchService.$selectedSucursal.set(selectedSucursal);
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
