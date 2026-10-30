import { signal, Service } from '@angular/core';

@Service()
export class FocusNavigationService {

  private readonly _searchInputFocusRequest = signal(0);
  $searchInputFocusRequest = this._searchInputFocusRequest.asReadonly();

  private readonly _qtyInputFocusRequest = signal(0);
  $qtyInputFocusRequest = this._qtyInputFocusRequest.asReadonly();

  private readonly _checkoutRowFocusRequest = signal(0);
  $checkoutRowFocusRequest = this._checkoutRowFocusRequest.asReadonly();

  requestQtyInputFocus() {
    this._qtyInputFocusRequest.update(v => v + 1);
  }

  requestSearchInputFocus() {
    this._searchInputFocusRequest.update(v => v + 1);
  }

  requestCheckoutRowFocus() {
    this._checkoutRowFocusRequest.update(v => v + 1);
  }
}
