import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TopicDto } from '../models/Dtos/topic.dto';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';
import { GetTopicsRequest } from '../models/Requests/get-topics-request';

@Injectable({
  providedIn: 'root'
})
export class TopicService extends BaseDopamineDetoxApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getTopics(request: GetTopicsRequest): Observable<TopicDto[]> {
    console.log("REQUEST", request);
    return this.http.post<TopicDto[]>(`${this.API_BASE_URL}/Topic/search`, request);
  }

  createTopic(topic: Omit<TopicDto, 'id'>): Observable<TopicDto> {
    return this.http.post<TopicDto>(`${this.API_BASE_URL}/Topic`, topic);
  }

  updateTopic(topic: TopicDto): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/Topic/${topic.id}`, topic);
  }

  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/Topic/${id}`);
  }
}
