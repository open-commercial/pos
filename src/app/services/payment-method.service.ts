import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormaDePago } from '../models/forma-de-pago.model';

@Service()
export class PaymentMethodService {

  http = inject(HttpClient);

  getPaymentMethods(): Observable<Array<FormaDePago>> {
    return this.http.get<Array<FormaDePago>>(`${environment.apiUrl}/api/v1/formas-de-pago`);
  }

}
