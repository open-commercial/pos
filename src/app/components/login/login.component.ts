import { Component, OnInit } from '@angular/core';
import { AuthService, Credential } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      const credencial: Credential = {
        username: 'facundo',
        password: 'password'
      }
      this.authService.login(credencial);
  }
}
