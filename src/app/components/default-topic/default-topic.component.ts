import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DefaultTopicService } from '../../services/default-topic.service';
import { DefaultTopicDto } from '../../models/Dtos/default-topic.dto'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-default-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './default-topic.component.html',
  styleUrls: ['./default-topic.component.css']
})
export class DefaultTopicComponent implements OnInit {
  defaultTopics: DefaultTopicDto[] = [];
  editingDefaultTopic: DefaultTopicDto | null = null;
  editedTerm: string = '';
  termMaxLength = 100;

  constructor(
    private apiService: DefaultTopicService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchDefaultTopics();
  }

  fetchDefaultTopics(): void {
    this.apiService.getDefaultTopics().subscribe({
      next: (fetchedDefaultTopics) => {
        this.defaultTopics = fetchedDefaultTopics;
      },
      error: (error) => {
        console.error('Error fetching default topics:', error);
        this.toastr.error('Failed to load default topics.', 'Error');
      }
    });
  }

  handleEditDefaultTopic(defaultTopic: DefaultTopicDto): void {
    this.editingDefaultTopic = defaultTopic;
    this.editedTerm = defaultTopic.term;
  }

  handleSaveEdit(): void {
    if (this.editingDefaultTopic && this.editedTerm.trim() !== '') {
      this.apiService.updateDefaultTopic({
        ...this.editingDefaultTopic,
        term: this.editedTerm.trim()
      }).subscribe({
        next: () => {
          this.fetchDefaultTopics();
          this.cancelEdit();
          this.toastr.success('Default Topic updated successfully', 'Success');
        },
        error: (error) => {
          console.error('Error updating default topic:', error);
          this.toastr.error('Failed to update Default Topic. Please try again.', 'Error');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingDefaultTopic = null;
    this.editedTerm = '';
  }

  handleDeleteDefaultTopic(id: number): void {
    if (confirm('Are you sure you want to delete this default topic?')) {
      this.apiService.deleteDefaultTopic(id).subscribe({
        next: () => {
          this.fetchDefaultTopics();
          this.toastr.success('Default Topic deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting default topic:', error);
          this.toastr.error('Failed to delete Default Topic. Please try again.', 'Error');
        }
      });
    }
  }

  navigateToAddDefaultTopic(): void {
    this.router.navigate(['/add-default-topic']);
  }
}
