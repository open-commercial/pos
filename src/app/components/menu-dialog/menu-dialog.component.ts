import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
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
export class MenuDialogComponent {
  form: FormGroup;
  sucursales: string[] = ["Globo de Oro 1", "Globo de Oro 2", "Globo de Oro 3"];
  sucursalesControl = new FormControl();

  constructor() {
    this.form = new FormGroup({
      sucursales: this.sucursalesControl,
    });
  }
}
