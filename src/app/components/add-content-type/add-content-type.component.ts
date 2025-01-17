import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentTypeService } from '../../services/content-type.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-content-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-content-type.component.html',
  styleUrls: ['./add-content-type.component.css']
})
export class AddContentTypeComponent {
  newTitle = '';
  newDescription = '';
  titleMaxLength = 100;
  descriptionMaxLength = 1000;
  titleTouched = false;
  descriptionTouched = false;

  constructor(
    private apiService: ContentTypeService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  handleAddContentType(): void {
    this.titleTouched = true;
    this.descriptionTouched = true;
    if (this.newTitle.trim() && this.newDescription.trim()) {
      this.apiService
        .createContentType({
          title: this.newTitle.trim(),
          description: this.newDescription.trim(),
        })
        .subscribe({
          next: () => {
            this.toastr.success('Content Type added successfully', 'Success');
            this.router.navigate(['/content-types']);
          },
          error: (error) => {
            console.error('Error adding content type:', error);
            this.toastr.error('Failed to add Content Type. Please try again.', 'Error');
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/content-types']);
  }

  onTitleFocus(): void {
    this.titleTouched = true;
  }

  onDescriptionFocus(): void {
    this.descriptionTouched = true;
  }
}
