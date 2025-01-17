import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentTypeService } from '../../services/content-type.service';
import { ContentTypeDto } from '../../models/Dtos/content-type.dto';
import { ToastrService } from 'ngx-toastr';
import { ResetApiCacheService } from '../../services/reset-api-cache-service.ts';

@Component({
  selector: 'app-content-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-type.component.html',
})
export class ContentTypeComponent implements OnInit {
  contentTypes: ContentTypeDto[] = [];
  editingContentType: ContentTypeDto | null = null;
  editedTitle: string = '';
  editedDescription: string = '';
  titleMaxLength = 100;
  descriptionMaxLength = 1000;

  constructor(
    private apiService: ContentTypeService,
    private router: Router,
    private toastr: ToastrService,
    private resetApiCacheService: ResetApiCacheService
  ) {}

  ngOnInit(): void {
    this.fetchContentTypes();
  }

  fetchContentTypes(): void {
    this.apiService.getContentTypes().subscribe({
      next: (fetchedContentTypes) => {
        this.contentTypes = fetchedContentTypes;
      },
      error: (error) => {
        console.error('Error fetching content types:', error);
        this.toastr.error('Failed to load content types.', 'Error');
      }
    });
  }

  handleEditContentType(contentType: ContentTypeDto): void {
    this.editingContentType = contentType;
    this.editedTitle = contentType.title;
    this.editedDescription = contentType.description;
  }

  handleSaveEdit(): void {
    if (this.editingContentType && this.editedTitle.trim() !== '' && this.editedDescription.trim() !== '') {
      this.apiService.updateContentType({
        ...this.editingContentType,
        title: this.editedTitle.trim(),
        description: this.editedDescription.trim()
      }).subscribe({
        next: () => {
          this.fetchContentTypes();
          this.cancelEdit();
          this.toastr.success('Content Type updated successfully', 'Success');
          this.resetApiCacheService.resetChannel().subscribe({
            next: () => {
              this.toastr.success('API cache reset', 'Success');
            },
            error: (error) => {
              console.error('Error resetting API cache:', error);
              this.toastr.error('Failed to reset API cache. Please try again.', 'Error');
            }
          });
        },
        error: (error) => {
          console.error('Error updating content type:', error);
          this.toastr.error('Failed to update Content Type. Please try again.', 'Error');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingContentType = null;
    this.editedTitle = '';
    this.editedDescription = '';
  }

  handleDeleteContentType(id: number): void {
    if (confirm('Are you sure you want to delete this content type?')) {
      this.apiService.deleteContentType(id).subscribe({
        next: () => {
          this.fetchContentTypes();
          this.toastr.success('Content Type deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting content type:', error);
          this.toastr.error('Failed to delete Content Type. Please try again.', 'Error');
        }
      });
    }
  }

  navigateToAddContentType(): void {
    this.router.navigate(['/add-content-type']);
  }
}
