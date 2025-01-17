import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SubTopicDto } from '../models/Dtos/sub-topic.dto';
import { GetSubTopicsRequest } from '../models/Requests/get-sub-topics-request';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';

@Injectable({
  providedIn: 'root'
})
export class SubTopicService extends BaseDopamineDetoxApiService {
  getSubTopics(request: GetSubTopicsRequest): Observable<SubTopicDto[]> {
    return this.http.post<SubTopicDto[]>(`${this.API_BASE_URL}/SubTopic/search`, request);
  }

  getSubTopic(id: number): Observable<SubTopicDto> {
    return this.http.get<SubTopicDto>(`${this.API_BASE_URL}/SubTopic/${id}`);
  }

  createSubTopic(subTopic: Omit<SubTopicDto, 'id' | 'topicTerm'>): Observable<SubTopicDto> {
    return this.http.post<SubTopicDto>(`${this.API_BASE_URL}/SubTopic`, subTopic);
  }

  updateSubTopic(subTopic: SubTopicDto): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/SubTopic/${subTopic.id}`, subTopic);
  }

  deleteSubTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/SubTopic/${id}`);
  }

  inactivateSubTopic(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_BASE_URL}/SubTopic/${id}/inactivate`, {});
  }
}
