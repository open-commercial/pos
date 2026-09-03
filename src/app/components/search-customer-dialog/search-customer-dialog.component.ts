import { Component, effect, ElementRef, inject, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CustomerAccountService } from 'src/app/services/customer-account.service';
import { BusquedaCuentaCorrienteClienteCriteria } from 'src/app/models/busqueda-cuenta-corriente-cliente-criteria.model';
import { NotificationService } from 'src/app/services/notification.service';
import { SERVICE_UNAVAILABLE_MESSAGE } from 'src/app/services/auth.service';
import { CuentaCorrienteCliente } from 'src/app/models/cuenta-corriente-cliente.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocalStorageKeys, LocalStorageUtil } from 'src/app/utils/local-storage-util';

@Component({
  selector: 'app-search-customer-dialog',
  templateUrl: './search-customer-dialog.component.html',
  styleUrls: ['./search-customer-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
  customerAccountService = inject(CustomerAccountService);
  $error = signal(false);
  storageService = inject(LocalStorageUtil);
  $loading = signal(false);
  $searchCriteria = signal('');
  $customers = signal<CuentaCorrienteCliente[]>([]);
  $selectedCustomerId = signal<number | null>(null);
  infiniteScrollPage = 0;
  isLastPage = true;
  readonly debounceTimeMs = 500;
  private debounceTimer: any;
  @ViewChild('customerSearchInput') customerSearchInput!: ElementRef<HTMLInputElement>;
  dialogRef = inject(MatDialogRef<SearchCustomerDialogComponent>);

  constructor() {
    this.$loading.set(true);
    this.loadSelectedCustomerId();
    effect(() => {
      const term = this.$searchCriteria().trim();
      this.infiniteScrollPage = 0;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.searchCustomers(term), this.debounceTimeMs);
    });
  }

  /*
    constructor() {
      this.$loading.set(true);
      this.authService.getLoggedUser()
        .pipe(
          switchMap(u => {
            this.$selectedSucursalId.set(u.idSucursalPredeterminada);
            return this.branchService.getBranches()
          }))
        .subscribe({
          next: (sucursales) => {
            this.$sucursales.set(sucursales);
            this.$loading.set(false);
          },
          error: (err) => {
            this.$loading.set(false);
            this.showErrorMessage(err);
            this.dialogRef.close();
          }
        });
    }
  */

  private loadSelectedCustomerId() {
    const customerAccount = this.storageService.getItem(LocalStorageKeys.CUSTOMER_ACCOUNT) as CuentaCorrienteCliente | null;
    this.$selectedCustomerId.set(customerAccount?.cliente?.idCliente ?? null);
  }

  searchCustomers(term: string) {
    this.$loading.set(true);
    this.$error.set(false);
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
    this.customerAccountService.search(criteria)
      .subscribe({
        next: (data) => {
          this.$customers.set(this.$customers().concat(data.content));
          this.isLastPage = data.last;
          if (this.infiniteScrollPage === 0) {
            setTimeout(() => this.customerSearchInput.nativeElement.focus(), 10);
          }
          this.$loading.set(false);
        },
        error: () => {
          if (this.infiniteScrollPage > 0) {
            this.infiniteScrollPage -= 1;
          }
          this.$loading.set(false);
          this.$error.set(true);
        }
      });
  }

  onCustomersScroll(event: Event) {
    if (this.$loading() || this.isLastPage) return;
    const element = event.target as HTMLElement;
    const scrollableHeight = element.scrollHeight - element.clientHeight;
    if (scrollableHeight <= 0) return;
    if (element.scrollTop >= scrollableHeight - 20) {
      if (!this.isLastPage) {
        this.infiniteScrollPage += 1;
        this.searchCustomers(this.$searchCriteria());
      }
    }
  }

  onEnter(customersList: MatSelectionList) {
    if (this.$loading()) return;
    const selected = customersList.selectedOptions.selected[0]?.value as CuentaCorrienteCliente | undefined;
    const customer = selected ?? this.$customers()[0];
    if (customer) {
      this.selectCustomerAccount(customer);
    }
  }

  selectCustomerAccount(selectedCustomer: CuentaCorrienteCliente) {
    this.storageService.setItem(LocalStorageKeys.CUSTOMER_ACCOUNT, selectedCustomer);
    this.dialogRef.close(selectedCustomer.cliente.nombreFiscal);
  }

}
