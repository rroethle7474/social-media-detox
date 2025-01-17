import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorLoggingService } from '../services/error-logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const errorLoggingService = this.injector.get(ErrorLoggingService);
    errorLoggingService.logError(error);

    console.error('An error occurred:', error);
  }
}
