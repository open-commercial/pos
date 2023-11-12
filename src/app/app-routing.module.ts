import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { ProductosComponent } from './components/productos/productos.component';

const MAIN_TITLE = 'Open Commercial';

const routes: Routes = [
  { path: 'login', title: MAIN_TITLE + " - Ingreso", component: LoginComponent, canActivate: [publicGuard] },
  { path: 'pos',
    title: MAIN_TITLE + " - Principal",
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: ProductosComponent }
    ]
  },
  { path: '', redirectTo: '/pos', pathMatch: 'full' },
  { path: '**', title: MAIN_TITLE + " - Page Not Found", component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
