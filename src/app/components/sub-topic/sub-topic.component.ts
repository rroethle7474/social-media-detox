import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubTopicService } from '../../services/sub-topic.service';
import { SubTopicDto } from '../../models/Dtos/sub-topic.dto';
import { ToastrService } from 'ngx-toastr';
import { TopicService } from '../../services/topic.service';
import { TopicDto } from '../../models/Dtos/topic.dto';
import { UserService } from '../../services/user.service';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';

@Component({
  selector: 'app-sub-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sub-topic.component.html',
})
export class SubTopicComponent implements OnInit {
  subTopics: SubTopicDto[] = [];
  editingSubTopic: SubTopicDto | null = null;
  editedTerm: string = '';
  editedIsActive: boolean = false;
  editedTopicId: number | null = null;
  currentUser: ApplicationUserDto | null = null;
  termMaxLength = 1000;
  topics: TopicDto[] = [];

  constructor(
    private subTopicService: SubTopicService,
    private router: Router,
    private toastr: ToastrService,
    private topicService: TopicService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.fetchSubTopics();
      this.fetchTopics();
    });
  }

  fetchSubTopics(): void {
    if (this.currentUser?.id) {
      this.subTopicService.getSubTopics({ userId: this.currentUser.id }).subscribe({
        next: (fetchedSubTopics) => {
          this.subTopics = fetchedSubTopics;
        },
        error: (error) => {
          console.error('Error fetching sub-topics:', error);
          this.toastr.error('Failed to load sub-topics.', 'Error');
        }
      });
    }
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

  handleEditSubTopic(subTopic: SubTopicDto): void {
    this.editingSubTopic = subTopic;
    this.editedTerm = subTopic.term;
    this.editedIsActive = subTopic.isActive;
    this.editedTopicId = subTopic.topicId;
  }

  handleSaveEdit(): void {
    if (this.editingSubTopic && this.editedTerm.trim() !== '' && this.editedTopicId) {
      if (this.editedTerm.length > this.termMaxLength) {
        this.toastr.error(`Term cannot exceed ${this.termMaxLength} characters.`, 'Error');
        return;
      }
      this.subTopicService.updateSubTopic({
        ...this.editingSubTopic,
        term: this.editedTerm.trim(),
        isActive: this.editedIsActive,
        topicId: this.editedTopicId
      }).subscribe({
        next: () => {
          this.fetchSubTopics();
          this.cancelEdit();
          this.toastr.success('Sub-Topic updated successfully', 'Success');
        },
        error: (error) => {
          console.error('Error updating sub-topic:', error);
          this.toastr.error('Failed to update Sub-Topic. Please try again.', 'Error');
        }
      });
    } else {
      this.toastr.error('Please provide a valid term and topic for the sub-topic.', 'Error');
    }
  }

  cancelEdit(): void {
    this.editingSubTopic = null;
    this.editedTerm = '';
    this.editedIsActive = false;
    this.editedTopicId = null;
  }

  handleDeleteSubTopic(id: number): void {
    if (confirm('Are you sure you want to delete this sub-topic?')) {
      this.subTopicService.deleteSubTopic(id).subscribe({
        next: () => {
          this.fetchSubTopics();
          this.toastr.success('Sub-Topic deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting sub-topic:', error);
          this.toastr.error('Failed to delete Sub-Topic. Please try again.', 'Error');
        }
      });
    }
  }

  navigateToAddSubTopic(): void {
    this.router.navigate(['/add-sub-topic']);
  }
}
