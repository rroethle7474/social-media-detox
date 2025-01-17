import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TopSearchResultDto } from '../models/Dtos/top-search-result.dto';
import { GetTopSearchResultsRequest } from '../models/Requests/get-top-search-results-request';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';


@Injectable({
  providedIn: 'root'
})
export class TopSearchResultService extends BaseDopamineDetoxApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getTopSearchResult(id: number): Observable<TopSearchResultDto> {
    return this.http.get<TopSearchResultDto>(`${this.API_BASE_URL}/TopSearchResult/${id}`);
  }

  getTopSearchResults(request: GetTopSearchResultsRequest): Observable<TopSearchResultDto[]> {
    return this.http.post<TopSearchResultDto[]>(`${this.API_BASE_URL}/TopSearchResult/search`, request);
  }

  createTopSearchResult(note: Omit<TopSearchResultDto, 'id'>): Observable<TopSearchResultDto> {
    return this.http.post<TopSearchResultDto>(`${this.API_BASE_URL}/TopSearchResult`, note);
  }

  updateTopSearchResult(note: TopSearchResultDto): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/TopSearchResultte/${note.id}`, note);
  }

  deleteTopSearchResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/TopSearchResult/${id}`);
  }
}
