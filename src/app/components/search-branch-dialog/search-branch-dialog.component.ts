import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';

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
    FormsModule,
    ReactiveFormsModule
  ],
})
export class SearchBranchDialogComponent {
  form: FormGroup;
  sucursales: string[] = ["Sucursal 1", "Sucursal 2", "Sucursal 3"];
  sucursalesControl = new FormControl();

  constructor() {
    this.form = new FormGroup({
      sucursales: this.sucursalesControl,
    });
  }
}
