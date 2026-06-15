import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action: string, duration: number) {
    const config = new MatSnackBarConfig();
    config.duration = duration;    
    const snackBarRef = this.snackBar.open(message, action, config);
    return snackBarRef;
  }
}
