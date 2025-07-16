import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { ProductosComponent } from './components/productos/productos.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  {
    path: 'pos', component: HomeComponent, canActivate: [authGuard], children:
      [
        { path: "", component: ProductosComponent }
      ]
  },
  { path: '', redirectTo: '/pos', pathMatch: 'full' },
  { path: '**', redirectTo: '/pos', pathMatch: 'full' },
];
