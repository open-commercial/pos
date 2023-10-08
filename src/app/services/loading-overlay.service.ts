import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingOverlayService {
  private readonly activeSignal = signal(false);
  private count = 0;

  isActive(): boolean {
    return this.activeSignal();
  }

  activate() {
    this.count += 1;
    this.activeSignal.set(this.count > 0);
  }

  deactivate() {
    this.count -= 1;
    this.activeSignal.set(this.count > 0);
  }
}
