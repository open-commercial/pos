import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { publicGuard } from './guards/public.guard';

const MAIN_TITLE = 'Punto de Ventas';

const routes: Routes = [
  { path: 'login', title: MAIN_TITLE + " - Ingreso", component: LoginComponent, canActivate: [publicGuard] },
  { path: 'passwor-reset', title: MAIN_TITLE + " - Cambio de contraseña", component: PasswordResetComponent, canActivate: [publicGuard] },
  { path: 'pos',
    title: MAIN_TITLE + " - Principal",
    component: HomeComponent,
    canActivate: [authGuard],
    children: [

    ]
  },
  { path: '',   redirectTo: '/pos', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
