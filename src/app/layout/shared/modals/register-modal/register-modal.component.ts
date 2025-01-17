import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { RegisterDto } from '../../../../models/Dtos/register.dto';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  close() {
    this.activeModal.dismiss('Cross click');
  }

  onRegister() {
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
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
        this.errorMessage = error.error.message || 'An error occurred during registration';
        this.toastr.error(this.errorMessage || 'An error occurred during registration');
      }
    });
  }
}
