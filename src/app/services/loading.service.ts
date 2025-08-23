import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {

  private readonly _active = signal(false);
  readonly active = this._active.asReadonly();

  activate() {
    this._active.set(true);
  }

  deactivate() {
    this._active.set(false);
  }
}
