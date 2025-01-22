import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BaseDopamineDetoxApiService {
  protected readonly API_BASE_URL = environment.apiUrl;

  constructor(protected http: HttpClient) {}
}
