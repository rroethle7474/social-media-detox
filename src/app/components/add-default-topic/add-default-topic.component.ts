import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DefaultTopicService } from '../../services/default-topic.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-default-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-default-topic.component.html',
  styleUrls: ['./add-default-topic.component.css']
})
export class AddDefaultTopicComponent {
  newTerm = '';
  excludeFromTwitter = false;
  termMaxLength = 100;
  termTouched = false;

  constructor(
    private apiService: DefaultTopicService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  handleAddDefaultTopic(): void {
    this.termTouched = true;
    if (this.newTerm.trim()) {
      this.apiService
        .createDefaultTopic({
          term: this.newTerm.trim(),
          excludeFromTwitter: this.excludeFromTwitter
        })
        .subscribe({
          next: () => {
            this.toastr.success('Default Topic added successfully', 'Success');
            this.router.navigate(['/default-topics']);
          },
          error: (error) => {
            console.error('Error adding default topic:', error);
            this.toastr.error('Failed to add Default Topic. Please try again.', 'Error');
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/default-topic']);
  }

  onTermFocus(): void {
    this.termTouched = true;
  }
}
