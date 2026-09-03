import { Service } from '@angular/core';
import crypto from 'crypto-js';

export enum LocalStorageKeys {
  TOKEN = 'token',
  ORDER = 'order',
  CUSTOMER_ACCOUNT = 'customer_account'
}

@Service()
export class LocalStorageUtil {

  getItem(key: string) {
    return this.decrypt(localStorage.getItem(key));
  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, this.encrypt(data));
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  private static getSK() {
    return 'MaritoPagaElAsado2025ConTodo!';
  }

  private encrypt(data: any): string {
    return crypto.AES.encrypt(JSON.stringify(data), LocalStorageUtil.getSK()).toString();
  }

  private decrypt(data: string | null) {
    if (data === null || data === undefined) {
      return null;
    }
    const bytes = crypto.AES.decrypt(data, LocalStorageUtil.getSK());
    return JSON.parse(bytes.toString(crypto.enc.Utf8));
  }
}
