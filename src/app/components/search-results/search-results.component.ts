import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchResultService } from '../../services/search-result.service';
import { UserService } from '../../services/user.service';
import { SearchResultDto } from '../../models/Dtos/search-result.dto';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';
import { Subscription } from 'rxjs';
import { YouTubePlayer } from '@angular/youtube-player';
import * as bootstrap from 'bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoteModalComponent } from '../../layout/shared/modals/note-modal/note-modal.component';
import { NoResultsComponent } from '../no-results/no-results.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, YouTubePlayer, NoResultsComponent, InfiniteScrollDirective],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('tweetContainer') tweetContainers!: QueryList<ElementRef>;

  allArticles: SearchResultDto[] = [];
  youtubeArticles: SearchResultDto[] = [];
  twitterArticles: SearchResultDto[] = [];
  currentUser: ApplicationUserDto | null = null;
  private userSubscription: Subscription | null = null;
  selectedArticle: SearchResultDto | null = null;
  private videoModal: bootstrap.Modal | null = null;
  activeTab: 'youtube' | 'twitter' = 'youtube';
  defaultImageUrl: string = 'assets/default_thumbnail.png';
  public twitterTabPreloaded: boolean = false;
  private intersectionObserver: IntersectionObserver | null = null;

  currentPage: { [key: string]: number } = { youtube: 1, twitter: 1 };
  itemsPerPage = 3;
  displayedArticles: { [key: string]: SearchResultDto[] } = { youtube: [], twitter: [] };
  isLoading = false;

  constructor(
    private searchResultService: SearchResultService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadAllArticles();
    });
    this.initVideoModal();
    this.loadTwitterWidget();
  }

  ngAfterViewInit() {
    // Initialize IntersectionObserver for lazy loading tweets
    this.setupIntersectionObserver();
    
    // Initial render for any visible tweets
    setTimeout(() => this.renderTweets(), 0);
    
    // Re-check when tweet containers change
    this.tweetContainers.changes.subscribe(() => {
      this.setupIntersectionObserver();
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    
    // Clean up IntersectionObserver
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  loadAllArticles() {
    if (this.currentUser?.id) {
      const headers = new HttpHeaders().set('X-Skip-Cache', 'true');
      this.searchResultService.getSearchResults({ userId: this.currentUser.id, isMVPResults: true }, { headers }).subscribe({
        next: (articles: SearchResultDto[]) => {
          this.allArticles = articles;
          console.log("ALL ARTICLES", this.allArticles);
          this.filterArticles();
        },
        error: (error) => {
          console.error('Error fetching MVP search results:', error);
          this.toastr.error('Error loading MVP articles');
        }
      });
    }
  }

  filterArticles() {
    this.youtubeArticles = this.allArticles.filter(article => article.contentTypeId === 2);
    this.twitterArticles = this.allArticles.filter(article => article.contentTypeId === 1);
    this.twitterTabPreloaded = false;

    this.currentPage = { youtube: 1, twitter: 1 };
    this.displayedArticles = { youtube: [], twitter: [] };
    this.loadMoreArticles('youtube');
    this.loadMoreArticles('twitter');

    if (this.activeTab === 'twitter') {
      this.renderTweets();
    } else {
      this.preloadTwitterTab();
    }
  }

  loadMoreArticles(contentType: 'youtube' | 'twitter') {
    if (this.isLoading) return;

    this.isLoading = true;
    const startIndex = (this.currentPage[contentType] - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    const articles = contentType === 'youtube' ? this.youtubeArticles : this.twitterArticles;
    const newArticles = articles.slice(startIndex, endIndex);
    this.displayedArticles[contentType] = [...this.displayedArticles[contentType], ...newArticles];
    this.currentPage[contentType]++;
    this.isLoading = false;
  }

  onScroll(contentType: 'youtube' | 'twitter') {
    this.loadMoreArticles(contentType);
  }

  setActiveTab(tab: 'youtube' | 'twitter') {
    this.activeTab = tab;
    if (tab === 'twitter') {
      // Allow time for DOM to update before rendering tweets
      setTimeout(() => {
        this.setupIntersectionObserver();
        this.renderTweets();
      }, 100);
    }
  }

  openVideoModal(article: SearchResultDto) {
    if (article.contentTypeId === 2 && this.videoModal) {
      this.selectedArticle = article;
      this.videoModal.show();
    }
  }

  closeVideoModal() {
    this.selectedArticle = null;
    if (this.videoModal) {
      this.videoModal.hide();
    }
  }

  private loadTwitterWidget() {
    if (!(window as any).twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.charset = 'utf-8';
      script.async = true;
      
      script.onload = () => {
        console.log('Twitter widget script loaded');
        this.renderTweets();
      };
      
      document.head.appendChild(script);
    } else {
      this.renderTweets();
    }
  }

  private setupIntersectionObserver() {
    // Disconnect previous observer if it exists
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    // Create new IntersectionObserver
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Tweet container is visible, render the tweet
          const tweetElement = entry.target as HTMLElement;
          if (tweetElement.dataset['rendered'] !== 'true') {
            // Mark as rendered to avoid re-rendering
            tweetElement.dataset['rendered'] = 'true';
            
            // Render this specific tweet
            if ((window as any).twttr && (window as any).twttr.widgets) {
              (window as any).twttr.widgets.load(tweetElement);
            }
          }
          
          // Stop observing this element
          this.intersectionObserver?.unobserve(entry.target);
        }
      });
    }, {
      root: null, // viewport
      rootMargin: '100px', // load tweets when they're 100px from viewport
      threshold: 0.1 // trigger when at least 10% of the element is visible
    });
    
    // Start observing tweet containers
    setTimeout(() => {
      if (this.tweetContainers) {
        this.tweetContainers.forEach(container => {
          this.intersectionObserver?.observe(container.nativeElement);
        });
      }
    }, 0);
  }

  renderTweets() {
    if ((window as any).twttr && (window as any).twttr.widgets) {
      // Only render tweets that are visible in the viewport
      if (this.tweetContainers) {
        this.tweetContainers.forEach(container => {
          const element = container.nativeElement;
          if (this.isElementInViewport(element) && element.dataset['rendered'] !== 'true') {
            element.dataset['rendered'] = 'true';
            (window as any).twttr.widgets.load(element);
          }
        });
      }
    } else {
      // Twitter script not loaded yet, retry after a delay
      setTimeout(() => this.renderTweets(), 200);
    }
  }
  
  private isElementInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= -100 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 100 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setDefaultImage(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImageUrl;
  }

  toggleTopResult(article: SearchResultDto) {
    article.topSearchResult = !article.topSearchResult;

    this.searchResultService.updateSearchResult(article).subscribe({
      next: (updatedArticle) => {
        this.toastr.success(article.topSearchResult ? 'Added to top results' : 'Removed from top results');
      },
      error: (error) => {
        console.error('Error updating top search result:', error);
        this.toastr.error('Error updating top search result');
        article.topSearchResult = !article.topSearchResult; // Revert the change
      }
    });
  }

  openNoteModal(article: SearchResultDto) {
    const modalRef = this.modalService.open(NoteModalComponent, { size: 'lg' });
    modalRef.componentInstance.searchResult = article;
    modalRef.componentInstance.currentUserId = this.currentUser?.id;
  }

  private initVideoModal() {
    const modalElement = document.getElementById('videoModal');
    if (modalElement) {
      this.videoModal = new bootstrap.Modal(modalElement);
    }
  }

  private preloadTwitterTab() {
    setTimeout(() => {
      this.twitterTabPreloaded = true;
      this.renderTweets();
    }, 0);
  }
}
