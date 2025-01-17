import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

import { LoginModalComponent } from '../modals/login-modal/login-modal.component';
import { RegisterModalComponent } from '../modals/register-modal/register-modal.component';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '../../../services/user.service';
import { ApplicationUserDto } from '../../../models/Dtos/application-user.dto';
import { SignalRService } from '../../../services/signalr.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgbDropdownModule,
    NgbOffcanvasModule,
    LoginModalComponent,
    RegisterModalComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobile = false;
  private destroy$ = new Subject<void>();

  @ViewChild('offcanvasContent') offcanvasContent: any;

  currentUser: ApplicationUserDto | null = null;
  notifications: { id: number; message: string; timestamp: Date }[] = [];
  hasUnreadNotifications = false;

  constructor(
    private offcanvasService: NgbOffcanvas,
    private modalService: NgbModal,
    private router: Router,
    private userService: UserService,
    private signalRService: SignalRService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.userService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.signalRService.isConnected().pipe(
      takeUntil(this.destroy$)
    ).subscribe((connected: boolean) => {
      if (connected) {
        this.setupSignalRHandlers();
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  openLoginModal() {
    this.modalService.open(LoginModalComponent, { centered: true });
  }

  openRegisterModal() {
    this.modalService.open(RegisterModalComponent, { centered: true });
  }

  openOffcanvas() {
    this.offcanvasService.open(this.offcanvasContent, { position: 'start' });
  }

  navigateToTopics() {
    this.router.navigate(['/topics']);
  }

  navigateToContentTypes() {
    this.router.navigate(['/content-types']);
  }

  navigateToSubTopics() {
    this.router.navigate(['/sub-topics']);
  }

  navigateToChannels() {
    this.router.navigate(['/channels']);
  }

  navigateToAccountProfile() {
    this.router.navigate(['/account-profile']);
  }

  navigateToDefaultTopics() {
    this.router.navigate(['/default-topic']);
  }

  navigateToChangePassword() {
    this.router.navigate(['/change-password']);
  }

  navigateToChangeEmail() {
    this.router.navigate(['/change-email']);
  }

  navigateToSearchResults() {
    this.router.navigate(['/search-results']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  private setupSignalRHandlers() {
    this.signalRService.onDataUpdated().subscribe((data: any) => {
      const message = `Content updated at ${new Date(data.updateTime).toLocaleString()}. Next update at ${new Date(data.nextUpdateTime).toLocaleString()}`;
      this.notifications.unshift({
        id: Date.now(),
        message,
        timestamp: new Date()
      });
      this.hasUnreadNotifications = true;
    });
  }

  markNotificationAsRead(notification: any) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
    if (this.notifications.length === 0) {
      this.hasUnreadNotifications = false;
    }
  }
}
