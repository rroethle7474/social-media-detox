import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';

@Injectable({
  providedIn: 'root'
})
export class ResetApiCacheService extends BaseDopamineDetoxApiService {

  resetChannel(): Observable<void> {
    return this.http.get<void>(`${this.API_BASE_URL}/Reset/clear-cache`);
  }
}
