import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleGridComponent } from '../article-grid/article-grid.component';
import { UserService } from '../../services/user.service';
import { QuoteService } from '../../services/quote.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterModalComponent } from '../../layout/shared/modals/register-modal/register-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-landing',
  standalone: true,
  imports: [CommonModule, ArticleGridComponent],
  templateUrl: './home-landing.component.html',
  styleUrls: ['./home-landing.component.css']
})
export class HomeLandingComponent implements OnInit {
  isLoggedIn = false;
  dailyQuote: string | null = null;
  dailyImageUrl: string | null = null;

  constructor(
    private userService: UserService,
    private quoteService: QuoteService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) {
        this.loadDailyQuote();
      }
    });
  }

  openRegisterModal() {
    this.modalService.open(RegisterModalComponent, { centered: true });
  }

  private loadDailyQuote() {
    console.log('LOADING DAILY QUOTE');
    this.quoteService.getDailyQuote().subscribe({
      next: (data) => {
        this.dailyQuote = data.quote;
        this.dailyImageUrl = data.imageUrl;
      },
      error: (error) => {
        console.error('Error loading daily quote:', error);
        this.dailyQuote = 'Take a moment to breathe and reflect.';
        this.dailyImageUrl = 'assets/default_image.png';
      }
    });
  }

  navigateToLearnMore() {
    this.router.navigate(['/learn-more']);
  }
}
