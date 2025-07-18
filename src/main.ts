import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/routes';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

registerLocaleData(localeEs);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'es-ES' },
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
});
