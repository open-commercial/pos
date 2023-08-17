import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';

const MAIN_TITLE = 'Punto de Ventas';

const routes: Routes = [
  { path: 'login', title: MAIN_TITLE + " - Ingreso", component: LoginComponent },
  { path: 'home',
    title: MAIN_TITLE + " - Principal",
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      
    ]
  },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
