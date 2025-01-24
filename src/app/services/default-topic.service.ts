import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DefaultTopicDto } from '../models/Dtos/default-topic.dto';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';

@Injectable({
  providedIn: 'root'
})
export class DefaultTopicService extends BaseDopamineDetoxApiService {
  private headers = new HttpHeaders().set('X-Skip-Cache', 'true');

  constructor(http: HttpClient) {
    super(http);
  }

  getDefaultTopics(): Observable<DefaultTopicDto[]> {
    return this.http.get<DefaultTopicDto[]>(`${this.API_BASE_URL}/DefaultTopic/All`, { headers: this.headers });
  }

  createDefaultTopic(defaultTopic: Omit<DefaultTopicDto, 'id'>): Observable<DefaultTopicDto> {
    return this.http.post<DefaultTopicDto>(`${this.API_BASE_URL}/DefaultTopic`, defaultTopic, { headers: this.headers });
  }

  updateDefaultTopic(defaultTopic: DefaultTopicDto): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/DefaultTopic/${defaultTopic.id}`, defaultTopic, { headers: this.headers });
  }

  deleteDefaultTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/DefaultTopic/${id}`, { headers: this.headers });
  }
}
