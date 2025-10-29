import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes)  // ← This registers your routes
  ]

}).catch(err => console.error(err));

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

  