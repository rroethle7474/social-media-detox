import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResetApiCacheService } from './reset-api-cache-service.ts';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionEstablished = new BehaviorSubject<boolean>(false);
  private dataUpdated = new Subject<any>();

  constructor(private toastr: ToastrService, private resetApiCacheService: ResetApiCacheService) {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      // First, call the negotiate endpoint
      console.log('Negotiating with SignalR Hub');
      const response = await fetch(`${environment.signalRUrl}/api/negotiate`, {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // }
      });

      if (!response.ok) {
        console.error('Failed to negotiate:', response);
        throw new Error(`Failed to negotiate: ${response.statusText}`);
      }
      // Log the raw response
      console.log('Negotiate response:', response);
      const responseText = await response.text();
      console.log('Raw negotiate response:', responseText);

      // Try to parse it as JSON
      let connectionInfo: any;
      try {
        connectionInfo = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse negotiate response as JSON:', e);
        throw e;
      }

      console.log('Parsed connection info:', connectionInfo);

      if (!connectionInfo.url || !connectionInfo.accessToken) {
        throw new Error('Invalid connection info received from negotiate endpoint');
      }

      // Create the connection using the URL from negotiate
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(connectionInfo.url, {
          accessTokenFactory: () => connectionInfo.accessToken
        })
        .withAutomaticReconnect()
        .build();

      // Start the connection
      await this.hubConnection.start();
      console.log('Connected to SignalR Hub');
      this.connectionEstablished.next(true);

      // Register the dataUpdated handler
      this.hubConnection.on('dataUpdated', (data: any) => {
        console.log('Received dataUpdated message:', data);
        this.dataUpdated.next(data);
        this.resetApiCacheService.resetChannel().subscribe({
          next: () => {
            this.notifyDataUpdated(data);
          },
          error: (error) => {
            console.error('Error receiving updated messages:', error);
            this.toastr.error('Content Updated but failed to retrieve. Please try again in 24 hours.', 'Error');
          }
        });

      });

    } catch (err) {
      console.error('Error establishing SignalR connection:', err);
      this.connectionEstablished.next(false);
      this.toastr.error('Failed to connect to SignalR hub', 'Connection Error');
    }
  }

  private notifyDataUpdated(data: any) {
    const updateTime = new Date(data.updateTime).toLocaleString();
    const nextUpdateTime = new Date(data.nextUpdateTime).toLocaleString();

    this.toastr.info(
      `Update received at ${updateTime}. Next update scheduled for ${nextUpdateTime}`,
      'Data Updated',
      { timeOut: 5000 }
    );
  }

  public isConnected(): Observable<boolean> {
    return this.connectionEstablished.asObservable();
  }

  // Optional: Method to manually reconnect
  public async reconnect() {
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }
    await this.initializeConnection();
  }

  public onDataUpdated(): Observable<any> {
    return this.dataUpdated.asObservable();
  }
}
