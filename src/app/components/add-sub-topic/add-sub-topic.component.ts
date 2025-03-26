import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubTopicService } from '../../services/sub-topic.service';
import { TopicService } from '../../services/topic.service';
import { TopicDto } from '../../models/Dtos/topic.dto';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';

@Component({
  selector: 'app-add-sub-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-sub-topic.component.html',
  styleUrls: ['./add-sub-topic.component.css']
})
export class AddSubTopicComponent implements OnInit {
  newSubTopic = '';
  isActive = true;
  excludeFromTwitter = false;
  selectedTopicId: number | null = null;
  topics: TopicDto[] = [];
  currentUser: ApplicationUserDto | null = null;
  termMaxLength = 1000;
  termTouched = false;
  topicTouched = false;

  constructor(
    private subTopicService: SubTopicService,
    private topicService: TopicService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.fetchTopics();
    });
  }

  fetchTopics(): void {
    if (this.currentUser?.id) {
      this.topicService.getTopics({ userId: this.currentUser.id }).subscribe({
        next: (fetchedTopics) => {
          this.topics = fetchedTopics;
        },
        error: (error) => {
          console.error('Error fetching topics:', error);
          this.toastr.error('Failed to load topics.', 'Error');
        }
      });
    }
  }

  handleAddSubTopic(): void {
    this.termTouched = true;
    this.topicTouched = true;
    if (this.newSubTopic.trim() && this.selectedTopicId && this.currentUser?.id) {
      this.subTopicService
        .createSubTopic({
          isActive: this.isActive,
          term: this.newSubTopic.trim(),
          topicId: this.selectedTopicId,
          userId: this.currentUser.id,
          excludeFromTwitter: this.excludeFromTwitter
        })
        .subscribe({
          next: () => {
            this.toastr.success('Sub-Topic added successfully', 'Success');
            this.router.navigate(['/sub-topics']);
          },
          error: (error) => {
            console.error('Error adding sub-topic:', error);
            this.toastr.error('Failed to add Sub-Topic. Please try again.', 'Error');
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/sub-topics']);
  }

  onTermFocus(): void {
    this.termTouched = true;
  }

  onTopicFocus(): void {
    this.topicTouched = true;
  }
}
