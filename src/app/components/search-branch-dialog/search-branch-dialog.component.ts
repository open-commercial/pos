import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { BranchService } from 'src/app/services/branch.service';
import { Sucursal } from 'src/app/models/sucursal.model';
import { AuthService } from 'src/app/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    MatDialogModule
  ],
})
export class SearchBranchDialogComponent {

  branchService = inject(BranchService);
  authService = inject(AuthService);
  userService = inject(UserService);
  notificationService = inject(NotificationService);
  dialogRef = inject(MatDialogRef<SearchBranchDialogComponent>);
  $branches = signal<Sucursal[]>([]);
  $selectedBranchId = signal<number>(0);
  $loading = signal(false);
  $error = signal(false);

  constructor() {
    this.loadBranches();
  }

  selectBranchAsDefault(selectedBranch: Sucursal) {
    this.$loading.set(true);
    this.authService.getLoggedUser()
      .pipe(switchMap(u => this.userService.setDefaultBranch(u.idUsuario, selectedBranch.idSucursal)))
      .subscribe({
        next: () => {
          this.branchService.$selectedSucursal.set(selectedBranch);
          this.$loading.set(false);
          this.dialogRef.close(selectedBranch.nombre);
        },
        error: () => {
          this.$loading.set(false);
          this.notificationService.openSnackBar(
            '❌ No se pudo establecer la sucursal seleccionada como predeterminada. Intente nuevamente',
            '',
            5000
          );
        }
      });
  }

  onBranchSelectionChange(event: MatSelectionListChange) {
    const selectedBranch = event.options[0]?.value as Sucursal | undefined;
    if (selectedBranch) {
      this.$selectedBranchId.set(selectedBranch.idSucursal);
    }
  }

  loadBranches() {
    this.$loading.set(true);
    this.$error.set(false);
    this.authService.getLoggedUser()
      .pipe(
        switchMap(u => {
          if (!this.$selectedBranchId()) {
            this.$selectedBranchId.set(u.idSucursalPredeterminada);
          }
          return this.branchService.getBranches();
        })
      )
      .subscribe({
        next: (branches) => {
          this.$branches.set(branches);
          this.$loading.set(false);
        },
        error: () => {
          this.$loading.set(false);
          this.$error.set(true);
        }
      });
  }

}
