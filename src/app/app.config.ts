import { ApplicationConfig, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { cacheInterceptor } from './interceptors/cache.interceptor';
import { GlobalErrorHandler } from './logging/global-error-handler';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([cacheInterceptor, loadingInterceptor])),
    provideAnimations(),
    importProvidersFrom(ToastrModule.forRoot()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
};
