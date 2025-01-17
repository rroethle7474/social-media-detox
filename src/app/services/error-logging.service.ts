import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';

interface WebTraceDto {
  errorCode?: string;
  errorMessage: string;
  callStack?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorLoggingService extends BaseDopamineDetoxApiService {
  private readonly STORAGE_KEY = 'error_logs';

  logError(error: any): void {
    const errorLog: WebTraceDto = {
      errorCode: error.code || 'UNKNOWN',
      errorMessage: error.message || 'Unknown error',
      callStack: error.stack,
    };

    this.storeErrorLocally(errorLog);
    this.syncErrorsWithServer();
  }

  private storeErrorLocally(errorLog: WebTraceDto): void {
    const storedLogs = this.getStoredLogs();
    storedLogs.push(errorLog);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedLogs));
  }

  private getStoredLogs(): WebTraceDto[] {
    const storedLogsString = localStorage.getItem(this.STORAGE_KEY);
    return storedLogsString ? JSON.parse(storedLogsString) : [];
  }

  private syncErrorsWithServer(): void {
    const storedLogs = this.getStoredLogs();
    if (storedLogs.length === 0) return;

    this.sendLogsToServer(storedLogs).subscribe({
      next: () => {
        localStorage.removeItem(this.STORAGE_KEY);
      },
      error: () => {
        // If sending fails, we keep the logs in localStorage for the next attempt
      }
    });
  }

  // private sendLogsToServer(logs: WebTraceDto[]): Observable<any> {
  //   // console.log("Sending logs to server", request);
  //   const payload = { request: logs };
  //   return this.http.post<WebTraceDto[]>(`${this.API_BASE_URL}/Logging/all`, payload).pipe(
  //     retry(3),
  //     catchError(error => {
  //       console.error('Failed to send logs to server', error);
  //       return of(null);
  //     })
  //   );
  // }

  // private sendLogsToServer(logs: WebTraceDto[]): Observable<any> {
  //   return this.http.post<WebTraceDto[]>(`${this.API_BASE_URL}/Logging/all`, logs).pipe(
  //     retry(3),
  //     catchError(error => {
  //       console.error('Failed to send logs to server', error);
  //       return of(null);
  //     })
  //   );
  // }

  private sendLogsToServer(logs: WebTraceDto[]): Observable<any> {
    let logs2: WebTraceDto[] = []; // create a new array of type WebTraceDto
    // add hardcoded values to the array

    console.log("STUPID ERROR", logs);
    logs2.push({ errorCode: '1', errorMessage: 'Test error', callStack: 'Test stack' });
    logs2.push({ errorCode: '2', errorMessage: 'Test error 2', callStack: 'Test stack 2' });

    const payload = { request: logs2 }; // Wrap logs in an object with a 'request' property
    return this.http.post<WebTraceDto[]>(`${this.API_BASE_URL}/Logging/all`, payload).pipe(
      retry(3),
      catchError(error => {
        console.error('Failed to send logs to server', error);
        return of(null);
      })
    );
  }
}
