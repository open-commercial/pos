import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from 'src/app/services/accounts.service';
import { BusquedaCuentaCorrienteClienteCriteria } from 'src/app/models/busqueda-cuenta-corriente-cliente-criteria.model';
import { NotificationService } from 'src/app/services/notification.service';
import { SERVICE_UNAVAILABLE_MESSAGE } from 'src/app/services/auth.service';
import { CuentaCorrienteCliente } from 'src/app/models/cuenta-corriente-cliente.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-search-customer-dialog',
  templateUrl: './search-customer-dialog.component.html',
  styleUrls: ['./search-customer-dialog.component.scss'],
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
})
export class SearchCustomerDialogComponent {

  notificationService = inject(NotificationService);
  accountService = inject(AccountService);
  $loading = signal(false);
  $searchCriteria = signal('');
  $customers = signal<CuentaCorrienteCliente[]>([]);
  $selectedCustomerId = signal<number | null>(null);
  infiniteScrollPage = 0;
  isLastPage = true;
  readonly debounceTimeMs = 500;
  private debounceTimer: any;
  @ViewChild('customerSearchInput') customerSearchInput!: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const term = this.$searchCriteria().trim();
      this.infiniteScrollPage = 0;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.searchCustomers(term), this.debounceTimeMs);
    });
  }

  searchCustomers(term: string) {
    this.$loading.set(true);
    const criteria: BusquedaCuentaCorrienteClienteCriteria = {
      nombreFiscal: term,
      nombreFantasia: term,
      idFiscal: isNaN(Number(term)) ? undefined : Number(term),
      nroDeCliente: term,
      pagina: this.infiniteScrollPage
    };
    if (this.infiniteScrollPage === 0) {
      this.$customers.set([]);
    }
    this.accountService.search(criteria)
      .subscribe({
        next: (data) => {
          this.$customers.set(this.$customers().concat(data.content));
          this.isLastPage = data.last;
          if (this.infiniteScrollPage === 0) {
            setTimeout(() => this.customerSearchInput.nativeElement.focus(), 10);
          }
          this.$loading.set(false);
        },
        error: (err) => {
          if (this.infiniteScrollPage > 0) {
            this.infiniteScrollPage -= 1;
          }
          this.$loading.set(false);
          this.showErrorMessage(err);
        }
      });
  }

  onCustomersScroll(event: Event) {
    if (this.$loading() || this.isLastPage) return;
    const element = event.target as HTMLElement;
    const scrollableHeight = element.scrollHeight - window.innerHeight;
    if (element.scrollTop >= scrollableHeight) {
      this.infiniteScrollPage += 1;
      this.searchCustomers(this.$searchCriteria());
    }
  }

  showErrorMessage(err: any) {
    if (err.status === 0) {
      this.notificationService.openSnackBar(SERVICE_UNAVAILABLE_MESSAGE, '', 3500);
    } else {
      this.notificationService.openSnackBar(err.error, '', 3500);
    }
  }
}
