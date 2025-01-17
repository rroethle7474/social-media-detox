import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/shared/header/header.component';
import { HomeLandingComponent } from './components/home-landing/home-landing.component';
import { FooterComponent } from './layout/shared/footer/footer.component';
import { SpinnerComponent } from './layout/shared/spinner/spinner.component';
import { SignalRService } from './services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, HomeLandingComponent, FooterComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private connectionSubscription: Subscription | undefined;
  isConnected: boolean = false;

  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.connectionSubscription = this.signalRService.isConnected().subscribe(
      connected => {
        this.isConnected = connected;
        // You could update UI here based on connection status
      }
    );
  }

  ngOnDestroy() {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }
}
