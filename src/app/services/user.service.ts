import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, delay, map, filter, Subject } from 'rxjs';
import { RegisterDto } from '../models/Dtos/register.dto';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';
import { LoginDto } from '../models/Dtos/login.dto';
import { LoginResponseDto } from '../models/Dtos/login-response.dto';
import { GoogleLoginDto } from '../models/Dtos/google-login.dto';
import { ApplicationUserDto } from '../models/Dtos/application-user.dto';
import { ForgetPasswordRequest } from '../models/Requests/forget-password-request.dto';
import { ResetPasswordRequest } from '../models/Requests/reset-password-request.dto';
import { UpdateAdminRequest } from '../models/Requests/update-admin-request';
import { UpdateProfileRequest } from '../models/Requests/update-profile-request';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseDopamineDetoxApiService {
  private currentUserSubject: BehaviorSubject<ApplicationUserDto | null> = new BehaviorSubject<ApplicationUserDto | null>(null);

  public currentUser$: Observable<ApplicationUserDto | null> = this.currentUserSubject.asObservable();

  private logoutSubject = new Subject<void>();
  public logout$ = this.logoutSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(registerData: RegisterDto): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/User/register`, registerData).pipe(
      tap((response: any) => {
        if (response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  login(loginData: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.API_BASE_URL}/User/login`, loginData).pipe(
      tap((response: LoginResponseDto) => {
        if (response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  googleLogin(googleLoginData: GoogleLoginDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.API_BASE_URL}/User/google-login`, googleLoginData).pipe(
      tap((response: LoginResponseDto) => {
        if (response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.logoutSubject.next();
  }

  private setCurrentUser(user: ApplicationUserDto) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  get currentUserValue(): ApplicationUserDto | null {
    return this.currentUserSubject.value;
  }

  changePassword(userId: string, userName: string, oldPassword: string, newPassword: string): Observable<any> {
    const payload = { userId, userName, oldPassword, newPassword };
    const headers = new HttpHeaders().set('X-Skip-Cache', 'true');
    return this.http.post(`${this.API_BASE_URL}/User/change-password`, payload, { headers });
  }

  changeEmail(userId: string, userName: string, oldEmail: string, newEmail: string): Observable<any> {
    const payload = { userId, userName, oldEmail, newEmail };
    return this.http.post(`${this.API_BASE_URL}/User/change-email`, payload).pipe(
      tap(() => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser && currentUser.id === userId) {
          const updatedUser = { ...currentUser, email: newEmail, userName: userName };
          this.setCurrentUser(updatedUser);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    const request: ForgetPasswordRequest = { email };
    return this.http.post(`${this.API_BASE_URL}/User/forget-password`, request);
  }

  resetPassword(resetPasswordData: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/User/reset-password`, resetPasswordData);
  }

  updateAdminStatus(updateRequest: UpdateAdminRequest): Observable<void> {
    return this.http.post<void>(`${this.API_BASE_URL}/User/is-admin`, updateRequest).pipe(
      tap(() => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser && currentUser.id === updateRequest.userId) {
          const updatedUser = { ...currentUser, isAdmin: updateRequest.isAdmin };
          this.setCurrentUser(updatedUser);
        }
      })
    );
  }

  updateUserProfile(updateRequest: UpdateProfileRequest): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/User/update-profile`, updateRequest).pipe(
      tap(() => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser && currentUser.id === updateRequest.userId) {
          const { newUserName, ...rest } = updateRequest;
          const updatedUser = { ...currentUser, ...rest, userName: newUserName ?? currentUser.userName };
          this.setCurrentUser(updatedUser);
        }
      })
    );
  }

  getCurrentUserId(): Observable<string> {
    return this.currentUser$.pipe(
      map(user => user ? user.id : null),
      filter((id): id is string => id !== null)
    );
  }

  deleteAccount(username: string): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/User/delete/${username}`).pipe(
      tap(() => {
        this.logout();
      })
    );
  }
}
