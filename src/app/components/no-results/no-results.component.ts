import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-no-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './no-results.component.html',
  styleUrls: ['./no-results.component.css']
})
export class NoResultsComponent {
  @Input() message: string = 'No results found';
  @Input() suggestion: string = 'Try adjusting your search or filters';
}
