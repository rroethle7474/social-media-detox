import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
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
    NgbOffcanvasModule
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
  private offcanvasRef: NgbOffcanvasRef | null = null;

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

        // Only setup SignalR handlers if the user is logged in
        if (user) {
          this.signalRService.isConnected().pipe(
            takeUntil(this.destroy$)
          ).subscribe((connected: boolean) => {
            if (connected) {
              this.setupSignalRHandlers();
            }
          });
        } else {
          // Clear notifications when user logs out
          this.notifications = [];
          this.hasUnreadNotifications = false;
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

  loginForDemo() {
    // Auto login with demo credentials
    const demoLoginData = {
      email: 'demo@demo.com',
      password: 'demoAccount1!'
    };

    this.userService.login(demoLoginData).subscribe({
      next: (response) => {
        console.log("Demo login successful");
        this.router.navigate(['/home']);
        this.closeOffcanvas();
      },
      error: (error) => {
        console.error("Demo login failed", error);
        // If demo login fails, fall back to opening the login modal
        this.openLoginModal();
      }
    });
  }

  openOffcanvas(content: any) {
    this.offcanvasRef = this.offcanvasService.open(content, {
      position: 'start',
      backdrop: true,
      keyboard: true,
      panelClass: 'bg-dark'
    });
  }

  private closeOffcanvas() {
    if (this.offcanvasRef) {
      this.offcanvasRef.close();
      this.offcanvasRef = null;
    }
  }

  navigateToTopics() {
    this.router.navigate(['/topics']);
    this.closeOffcanvas();
  }

  navigateToContentTypes() {
    this.router.navigate(['/content-types']);
    this.closeOffcanvas();
  }

  navigateToSubTopics() {
    this.router.navigate(['/sub-topics']);
    this.closeOffcanvas();
  }

  navigateToChannels() {
    this.router.navigate(['/channels']);
    this.closeOffcanvas();
  }

  navigateToAccountProfile() {
    this.router.navigate(['/account-profile']);
    this.closeOffcanvas();
  }

  navigateToDefaultTopics() {
    this.router.navigate(['/default-topic']);
    this.closeOffcanvas();
  }

  navigateToChangePassword() {
    this.router.navigate(['/change-password']);
    this.closeOffcanvas();
  }

  navigateToChangeEmail() {
    this.router.navigate(['/change-email']);
    this.closeOffcanvas();
  }

  navigateToSearchResults() {
    if (this.currentUser) {
      this.router.navigate(['/search-results']);
      this.closeOffcanvas();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
    this.closeOffcanvas();
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
