import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { RegisterDto } from '../../../../models/Dtos/register.dto';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { EmailValidatorDirective } from '../../../../directives/email-validator.directive';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, EmailValidatorDirective],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css']
})
export class RegisterModalComponent {
  registerData: RegisterDto = {
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  };
  confirmPassword: string = '';
  errorMessage: string | null = null;
  emailTouched = false;

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  close() {
    this.activeModal.dismiss('Cross click');
  }

  onEmailBlur() {
    this.emailTouched = true;
  }

  onRegister() {
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.toastr.error('Passwords do not match');
      return;
    }

    this.errorMessage = null;
    this.userService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.activeModal.close(response);
        this.toastr.success('Registration successful');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Registration failed', error);
        const errorMessage = error.error.message || 'An error occurred during registration';
        this.errorMessage = errorMessage;

        // Keep modal open for validation errors (typically 400 status)
        if (error.status === 400) {
          this.toastr.error(errorMessage);
        } else {
          // Close modal for system errors (500, network issues, etc)
          this.activeModal.dismiss('Registration failed');
          this.toastr.error(errorMessage);
        }
      }
    });
  }
}
