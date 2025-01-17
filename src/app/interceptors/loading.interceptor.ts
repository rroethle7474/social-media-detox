// loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SpinnerService } from '../services/spinner.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);

  if (req.method !== 'GET' || !req.headers.has('noSpinner')) {
    spinnerService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (req.method !== 'GET' || !req.headers.has('noSpinner')) {
        spinnerService.hide();
      }
    })
  );
};
