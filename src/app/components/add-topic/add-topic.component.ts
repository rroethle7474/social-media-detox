import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { UserService } from '../../services/user.service';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-topic.component.html',
  styleUrls: ['./add-topic.component.css']
})
export class AddTopicComponent implements OnInit {
  newTopic = '';
  isActive = true;
  maxLength = 100;
  touched = false;
  currentUser: ApplicationUserDto | null = null;

  constructor(
    private apiService: TopicService,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  handleAddTopic(): void {
    this.touched = true;
    if (this.newTopic.trim() && this.currentUser?.id) {
      console.log("ADDING TOPIC", this.newTopic, "Is Active:", this.isActive);
      this.apiService
        .createTopic({
          isActive: this.isActive,
          term: this.newTopic.trim(),
          userId: this.currentUser.id,
        })
        .subscribe({
          next: () => {
            this.toastr.success('Topic added successfully', 'Success');
            this.router.navigate(['/topics']);
          },
          error: (error) => {
            console.error('Error adding topic:', error);
            this.toastr.error('Failed to add topic. Please try again.', 'Error');
          }
        });
    } else {
      this.toastr.error('Please enter a topic and ensure you are logged in.', 'Error');
    }
  }

  goBack(): void {
    this.router.navigate(['/topics']);
  }

  onInputFocus(): void {
    this.touched = true;
  }
}
