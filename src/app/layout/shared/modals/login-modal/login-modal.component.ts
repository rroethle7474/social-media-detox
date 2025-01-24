import { Component, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { LoginDto } from '../../../../models/Dtos/login.dto';
import { GoogleLoginDto } from '../../../../models/Dtos/google-login.dto';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { RegisterModalComponent } from '../register-modal/register-modal.component';

declare var google: any;

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements AfterViewInit {
  showForgotPassword = false;
  loginData: LoginDto = { email: '', password: '' };
  errorMessage: string | null = null;
  isGoogleButtonRendered = false;
  forgotPasswordEmail: string = '';
  forgotPasswordMessage: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
    console.log("Current origin:", window.location.origin);
  }

  initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '832487934855-f2i3u5dg1q5c6dacbmp1afhvammj38ai.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this)
      });
      this.renderGoogleButton();
    } else {
      console.error('Google Identity Services not loaded');
    }
  }

  renderGoogleButton() {
    const buttonElement = document.getElementById("googleSignInButton");
    if (buttonElement) {
      google.accounts.id.renderButton(buttonElement, { theme: "outline", size: "large" });
      this.isGoogleButtonRendered = true;
      this.cdr.detectChanges();
    } else {
      console.error('Google Sign-In button element not found');
    }
  }

  handleCredentialResponse(response: any) {
    console.log("Credential RESPONSE",response);
    this.ngZone.run(() => {
      const idToken = response.credential;
      console.log("ID TOKEN",idToken);
      this.onGoogleLogin(idToken);
    });
  }

  onGoogleLogin(idToken: string) {
    console.log("ID TOKEN GOOGLE LOGIN",idToken);
    const googleLoginData: GoogleLoginDto = { IdToken: idToken };
    this.userService.googleLogin(googleLoginData).subscribe({
      next: (response) => {
        console.log("GOOGLE RESPONSE",response);
        this.activeModal.close(response);
        this.toastr.success('Google login successful');
      },
      error: (error) => {
        console.log("GOOGLE ERROR",error);
        this.errorMessage = error.error.message || 'An error occurred during Google login';
      }
    });
  }

  close() {
    this.activeModal.dismiss('Cross click');
  }

  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
  }

  onLogin() {
    this.errorMessage = null;
    this.userService.login(this.loginData).subscribe({
      next: (response) => {
        this.activeModal.close(response);
        console.log("LOGIN RESPONSE", response);
        this.toastr.success('Login successful');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.log("LOGIN ERROR", error);
        this.errorMessage = error.error.message || 'An error occurred during login';
      }
    });
  }

  onForgotPassword() {
    this.errorMessage = null;
    this.forgotPasswordMessage = null;
    this.userService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (response) => {
        this.forgotPasswordMessage = response.message;
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'An error occurred while processing your request';
      }
    });
  }

  private getGoogleIdToken(): string {
    // Implement Google Sign-In here and return the IdToken
    // This is a placeholder and should be replaced with actual Google Sign-In logic
    return 'placeholder-google-id-token';
  }

  openRegisterModal() {
    this.activeModal.dismiss();
    this.modalService.open(RegisterModalComponent, { centered: true });
  }
}
