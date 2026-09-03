import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FocusNavigationService {

  private readonly _qtyInputFocusRequest = signal(0);
  $qtyInputFocusRequest = this._qtyInputFocusRequest.asReadonly();

  private readonly _checkoutRowFocusRequest = signal(0);
  $checkoutRowFocusRequest = this._checkoutRowFocusRequest.asReadonly();

  requestQtyInputFocus() {
    this._qtyInputFocusRequest.update(v => v + 1);
  }

  requestCheckoutRowFocus() {
    this._checkoutRowFocusRequest.update(v => v + 1);
  }
}
