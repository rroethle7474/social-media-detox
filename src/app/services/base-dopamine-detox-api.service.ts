import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BaseDopamineDetoxApiService {
  protected readonly API_BASE_URL = 'https://localhost:7237/api';

  constructor(protected http: HttpClient) {}
}
