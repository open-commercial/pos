import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

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
  faCircleUser as fasCircleUser,
  faArrowRightFromBracket, //It's not necessary to rename because there's no other version of this icon
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      //regular
      farCircleUser,
      //solid
      fasCircleUser,
      faArrowRightFromBracket
    );
  }
}
