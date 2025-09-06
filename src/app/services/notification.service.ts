import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action: string = '', duration: number = 3500) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    return this.snackBar.open(message, action, config);
  }
}
