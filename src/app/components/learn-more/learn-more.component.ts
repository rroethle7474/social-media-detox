import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearnMoreService } from '../../services/learn-more.service';
import { LearnMoreDto } from '../../models/Dtos/learn-more-dto';

interface ProcessedItem {
  title: string;
  content: string;
}

@Component({
  selector: 'app-learn-more',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.css']
})
export class LearnMoreComponent implements OnInit {
  introduction: string = '';
  items: ProcessedItem[] = [];
  isLoading: boolean = true;

  constructor(private learnMoreService: LearnMoreService) {}

  ngOnInit() {
    this.learnMoreService.getLearnMoreContent().subscribe({
      next: (data: LearnMoreDto) => {
        this.introduction = data.introduction;
        this.processItems(data.items);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching learn more content:', error);
        this.isLoading = false;
      }
    });
  }

  private processItems(itemsString: string) {
    console.log("IN HERE", itemsString);
    // Split the string into sections (titles and content)
    const [titleSection, ...contentSections] = itemsString.split('\n\n').filter(Boolean);
    console.log("TITLE SECTION", titleSection);
    console.log("CONTENT SECTIONS", contentSections);
    // Get all titles from the first line
    const titles = titleSection.split('||').map(title => title.trim());
    console.log("TITLES", titles);
    // Process each content section
    this.items = contentSections.map((content, index) => {
      const title = titles[index] || '';
      // Remove the title from the content and clean up
      const cleanContent = content.replace(`${title}:`, '').trim();

      return {
        title,
        content: cleanContent
      };
    });
  }
}
