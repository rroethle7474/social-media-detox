import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TopicService } from '../../services/topic.service';
import { TopicDto } from '../../models/Dtos/topic.dto';
import { GetTopicsRequest } from '../../models/Requests/get-topics-request';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';
import { SubTopicService } from '../../services/sub-topic.service';
import { GetSubTopicsRequest } from '../../models/Requests/get-sub-topics-request';

@Component({
  selector: 'app-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topic.component.html',
})
export class TopicComponent implements OnInit {
  topics: TopicDto[] = [];
  editingTopic: TopicDto | null = null;
  editedTerm: string = '';
  editedIsActive: boolean = false;
  currentUser: ApplicationUserDto | null = null;

  constructor(
    private apiService: TopicService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private subTopicService: SubTopicService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.fetchTopics();
    });

  }

  fetchTopics(): void {
    const request: GetTopicsRequest = {
      userId: this.currentUser?.id || ''
    };
    console.log("CURRENT USER", this.currentUser);
    this.apiService.getTopics(request).subscribe({
      next: (fetchedTopics) => {
        this.topics = fetchedTopics;
      },
      error: (error) => {
        console.error('Error fetching topics:', error);
        this.toastr.error('Failed to Load topics.');
      }
    });
  }

  handleEditTopic(topic: TopicDto): void {
    this.editingTopic = topic;
    this.editedTerm = topic.term;
    this.editedIsActive = topic.isActive;
  }

  handleSaveEdit(): void {
    if (this.editingTopic && this.editedTerm.trim() !== '') {
      this.apiService.updateTopic({
        ...this.editingTopic,
        term: this.editedTerm.trim(),
        isActive: this.editedIsActive
      }).subscribe({
        next: () => {
          this.fetchTopics();
          this.cancelEdit();
          this.toastr.success('Topic Updated', 'Success');
        },
        error: (error) => {
          console.error('Error updating topic:', error);
          this.toastr.error('Failed to Update topic. Please try again.', 'Error');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingTopic = null;
    this.editedTerm = '';
    this.editedIsActive = false;
  }

  handleDeleteTopic(id: number): void {
    if (confirm('Are you sure you want to delete this topic?')) {
      const getSubTopicsRequest: GetSubTopicsRequest = {
        topicId: id,
        userId: this.currentUser?.id || ''
      };

      // First check for subtopics
      this.subTopicService.getSubTopics(getSubTopicsRequest).subscribe({
        next: (subTopics) => {
          if (subTopics.length > 0) {
            const subTopicNames = subTopics.map(subTopic => subTopic.term).join(', ');
            this.toastr.error(`Cannot delete topic with sub-topics. Please delete sub-topic(s) associated with this topic first: ${subTopicNames}`, 'Error');
            return;
          }

          // Only proceed with deletion if no subtopics exist
          this.apiService.deleteTopic(id).subscribe({
            next: () => {
              this.fetchTopics();
              this.toastr.success('Topic was deleted successfully', 'Success');
            },
            error: (error) => {
              console.error('Error deleting topic:', error);
              this.toastr.error('Failed to delete topic. Please try again.', 'Error');
            }
          });
        },
        error: (error) => {
          console.error('Error fetching sub-topics:', error);
          this.toastr.error('Failed to delete topic. Please try again.', 'Error');
        }
      });
    }
  }

  navigateToAddTopic(): void {
    this.router.navigate(['/add-topic']);
  }
}
