import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  private requestCount = 0;

  constructor(private ngZone: NgZone) {}

  show() {
    this.ngZone.run(() => {
      this.requestCount++;
      if (this.requestCount === 1) {
        console.log("Showing spinner");
        console.log("Request count:", this.requestCount);
        this.loadingSubject.next(true);
      }
    });
  }

  hide() {
    this.ngZone.run(() => {
      this.requestCount = Math.max(0, this.requestCount - 1);
      if (this.requestCount === 0) {
        console.log("Hiding spinner");
        this.loadingSubject.next(false);
      }
    });
  }
}
