import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NoteDto } from '../models/Dtos/note.dto';
import { GetNotesRequest } from '../models/Requests/get-notes-request';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';


@Injectable({
  providedIn: 'root'
})
export class NoteService extends BaseDopamineDetoxApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getNote(id: number): Observable<NoteDto> {
    return this.http.get<NoteDto>(`${this.API_BASE_URL}/Note/${id}`);
  }

  getNotes(request: GetNotesRequest): Observable<NoteDto[]> {
    return this.http.post<NoteDto[]>(`${this.API_BASE_URL}/Note/search`, request);
  }

  createNote(note: Omit<NoteDto, 'id'>): Observable<NoteDto> {
    return this.http.post<NoteDto>(`${this.API_BASE_URL}/Note`, note);
  }

  updateNote(note: NoteDto): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/Note/${note.id}`, note);
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/Note/${id}`);
  }
}
