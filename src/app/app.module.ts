import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';

/**
  FontAwesome icons always rename fa variable with prefix far (regular), fas (solid), fab (brand)
  if there is several versions of the same icon
*/
//Regular
import {
  faCircleUser as farCircleUser
} from '@fortawesome/free-regular-svg-icons';
//Solid
import {
  faCircleUser as fasCircleUser, faUser as fasUser,
  faArrowRightFromBracket, //It's not necessary to rename because there's no other version of this icon
  faKey as fasKey, faSpinner as fasSpinner
} from '@fortawesome/free-solid-svg-icons';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    HomeComponent,
    PasswordResetComponent,
    LoadingOverlayComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      //regular
      farCircleUser,
      //solid
      fasCircleUser, fasUser, faArrowRightFromBracket, fasKey, fasSpinner
    );
  }
}
