// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }      from './app/app.component';
import { provideRouter }     from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { routes }            from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor }   from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(FormsModule),
    provideHttpClient(
      withInterceptors([ AuthInterceptor ])
    )
  ]
});
