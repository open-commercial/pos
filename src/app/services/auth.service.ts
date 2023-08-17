import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Credential {
  username: string;
  password: string;
}

const loginUrl = environment.apiUrl + '/api/v1/login';
const logoutUrl = environment.apiUrl + '/api/v1/logout';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  login(credencial: Credential) {
    console.log(environment);
  }
}
