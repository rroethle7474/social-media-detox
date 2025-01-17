import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';
import { EmailValidatorDirective } from '../../directives/email-validator.directive';

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EmailValidatorDirective],
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.css']
})
export class ChangeEmailComponent implements OnInit {
  changeEmailForm: FormGroup;
  errorMessage: string | null = null;
  currentUser: ApplicationUserDto | null = null;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.changeEmailForm = this.fb.group({
      newEmail: ['', [Validators.required, EmailValidatorDirective.validateEmail]],
      confirmEmail: ['', [Validators.required, EmailValidatorDirective.validateEmail]]
    }, { validator: this.emailMatchValidator });
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  emailMatchValidator(g: FormGroup) {
    return g.get('newEmail')?.value === g.get('confirmEmail')?.value
      ? null : { 'mismatch': true };
  }

  onChangeEmail() {
    if (this.changeEmailForm.valid && this.currentUser && this.currentUser.id && this.currentUser.userName && this.currentUser.email) {
      const { newEmail } = this.changeEmailForm.value;
      this.userService.changeEmail(
        this.currentUser.id,
        this.currentUser.userName,
        this.currentUser.email,
        newEmail
      ).subscribe({
        next: (response) => {
          this.toastr.success('Email changed successfully');
          this.changeEmailForm.reset();
        },
        error: (error) => {
          console.error('Error changing email:', error);
          this.errorMessage = error.error?.message || 'An error occurred while changing the email';
          this.toastr.error(this.errorMessage || 'An error occurred while changing the email');
        }
      });
    }
  }
}
