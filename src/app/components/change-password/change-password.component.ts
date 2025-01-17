import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';
import { PasswordValidatorDirective } from '../../directives/password-validator.directive';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordValidatorDirective],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  errorMessage: string | null = null;
  currentUser: ApplicationUserDto | null = null;
  oldPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, PasswordValidatorDirective.validatePassword]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onChangePassword() {
    if (this.changePasswordForm.valid && this.currentUser && this.currentUser.id && this.currentUser.userName) {
      const { oldPassword, newPassword } = this.changePasswordForm.value;
      this.userService.changePassword(
        this.currentUser.id,
        this.currentUser.userName,
        oldPassword,
        newPassword
      ).subscribe({
        next: () => {
          this.toastr.success('Password changed successfully');
          this.changePasswordForm.reset();
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.errorMessage = error.error?.message || 'An error occurred while changing the password';
          this.toastr.error(this.errorMessage || 'An error occurred while changing the password');
        }
      });
    }
  }

  togglePasswordVisibility(field: 'oldPassword' | 'newPassword' | 'confirmPassword') {
    this[`${field}Visible`] = !this[`${field}Visible`];
  }
}
