import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export class AccountProfileComponent implements OnInit {
  currentUser: ApplicationUserDto | null = null;
  isAdmin: boolean = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.isAdmin || false;
    });
  }

  onSubmit() {
    if (this.currentUser && this.currentUser.id) {
      const updateRequest = {
        userId: this.currentUser.id,
        isAdmin: this.isAdmin
      };

      this.userService.updateAdminStatus(updateRequest).subscribe({
        next: () => {
          this.toastr.success('Admin status updated successfully');
        },
        error: (error) => {
          console.error('Error updating admin status:', error);
          this.toastr.error('Failed to update admin status');
          // Revert the checkbox if the update failed
          this.isAdmin = this.currentUser?.isAdmin || false;
        }
      });
    }
  }

  deleteAccount() {
    console.log('deleteAccount called');
    if (confirm('This action cannot be reversed and will remove your account. Are you sure?')) {
      if (this.currentUser && this.currentUser.userName) {
        this.userService.deleteAccount(this.currentUser.userName).subscribe({
          next: () => {
            this.toastr.success('Account deleted successfully');
            this.userService.logout();
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error deleting account:', error);
            this.toastr.error('Failed to delete account');
          }
        });
      }
    }
  }

  // Add the updateProfile method
  updateProfile() {
    if (this.currentUser && this.currentUser.id) {
      const updateRequest = {
        userId: this.currentUser.id,
        firstName: this.currentUser.firstName ?? undefined,
        lastName: this.currentUser.lastName ?? undefined,
        isAdmin: this.isAdmin
      };

      this.userService.updateUserProfile(updateRequest).subscribe({
        next: () => {
          this.toastr.success('Profile updated successfully');
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.toastr.error('Failed to update profile');
        }
      });
    }
  }
}
