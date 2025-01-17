import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChannelDto } from '../models/Dtos/channel.dto';
import { GetChannelsRequest } from '../models/Requests/get-channels-request';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService extends BaseDopamineDetoxApiService {
  getChannels(request: GetChannelsRequest): Observable<ChannelDto[]> {
    return this.http.post<ChannelDto[]>(`${this.API_BASE_URL}/Channel/search`, request);
  }

  getChannel(id: number): Observable<ChannelDto> {
    return this.http.get<ChannelDto>(`${this.API_BASE_URL}/Channel/${id}`);
  }

  getChannelBySlug(id: number): Observable<string> {
    return this.http.get<string>(`${this.API_BASE_URL}/Channel/${id}`);
  }

  createChannel(channel: Omit<ChannelDto, 'id'>): Observable<ChannelDto> {
    return this.http.post<ChannelDto>(`${this.API_BASE_URL}/Channel`, channel);
  }

  updateChannel(channel: ChannelDto): Observable<void> {
    return this.http.put<void>(`${this.API_BASE_URL}/Channel/${channel.id}`, channel);
  }

  deleteChannel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/Channel/${id}`);
  }
}
