import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';
import { GetSearchResultsRequest } from '../models/Requests/get-search-results-request';
import { SearchResultDto } from '../models/Dtos/search-result.dto';

@Injectable({
  providedIn: 'root'
})
export class SearchResultService extends BaseDopamineDetoxApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getSearchResults(request: GetSearchResultsRequest, options?: { headers?: HttpHeaders }): Observable<SearchResultDto[]> {
    return this.http.post<SearchResultDto[]>(`${this.API_BASE_URL}/SearchResult/search`, request, options);
  }

  updateSearchResult(searchResult: SearchResultDto): Observable<SearchResultDto> {
    console.log("Sending update to API:", searchResult);
    return this.http.put<SearchResultDto>(`${this.API_BASE_URL}/SearchResult/${searchResult.id}`, searchResult);
  }
  
  deleteSearchResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/SearchResult/${id}`);
  }
}
