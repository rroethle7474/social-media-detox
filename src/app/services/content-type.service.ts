import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContentTypeDto } from '../models/Dtos/content-type.dto';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';

@Injectable({
  providedIn: 'root'
})
export class ContentTypeService extends BaseDopamineDetoxApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getContentTypes(): Observable<ContentTypeDto[]> {
    return this.http.get<ContentTypeDto[]>(`${this.API_BASE_URL}/ContentType`, { headers: new HttpHeaders().set('X-Skip-Cache', 'true') });
  }

  createContentType(contentType: Omit<ContentTypeDto, 'id' | 'createdOn' | 'updatedOn'>): Observable<ContentTypeDto> {
    return this.http.post<ContentTypeDto>(`${this.API_BASE_URL}/ContentType`, contentType, { headers: new HttpHeaders().set('X-Skip-Cache', 'true') });
  }

  updateContentType(contentType: ContentTypeDto): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/ContentType/${contentType.id}`, contentType, { headers: new HttpHeaders().set('X-Skip-Cache', 'true') });
  }

  deleteContentType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/ContentType/${id}`, { headers: new HttpHeaders().set('X-Skip-Cache', 'true') });
  }
}
