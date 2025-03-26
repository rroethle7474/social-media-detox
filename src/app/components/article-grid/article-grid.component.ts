import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchResultService } from '../../services/search-result.service';
import { UserService } from '../../services/user.service';
import { TopicService } from '../../services/topic.service';
import { DefaultTopicService } from '../../services/default-topic.service';
import { ChannelService } from '../../services/channel.service';
import { SearchResultDto } from '../../models/Dtos/search-result.dto';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';
import { TopicDto } from '../../models/Dtos/topic.dto';
import { DefaultTopicDto } from '../../models/Dtos/default-topic.dto';
import { ChannelDto } from '../../models/Dtos/channel.dto';
import { Subscription } from 'rxjs';
import { YouTubePlayer } from '@angular/youtube-player';
import * as bootstrap from 'bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { ToastrService } from 'ngx-toastr';
import { NoteService } from '../../services/note-service';
import { NoteDto } from '../../models/Dtos/note.dto';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoteModalComponent } from '../../layout/shared/modals/note-modal/note-modal.component';
import { NoResultsComponent } from '../no-results/no-results.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-article-grid',
  templateUrl: './article-grid.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, YouTubePlayer, NoResultsComponent, InfiniteScrollDirective],
  styleUrls: ['./article-grid.component.css']
})
export class ArticleGridComponent implements OnInit, OnDestroy {
  allArticles: SearchResultDto[] = [];
  filteredArticles: SearchResultDto[] = [];
  youtubeArticles: SearchResultDto[] = [];
  twitterArticles: SearchResultDto[] = [];
  currentUser: ApplicationUserDto | null = null;
  topics: TopicDto[] = [];
  defaultTopics: DefaultTopicDto[] = [];
  selectedTopic: string | null = null;
  selectedDefaultTopic: string | null = null;
  private userSubscription: Subscription | null = null;
  selectedArticle: SearchResultDto | null = null;
  private videoModal: bootstrap.Modal | null = null;
  activeTab: 'youtube' | 'twitter' = 'youtube';
  private noteModal: bootstrap.Modal | null = null;
  selectedNoteArticle: SearchResultDto | null = null;
  noteTitle: string = '';
  noteMessage: string = '';
  defaultImageUrl: string = 'assets/default_thumbnail.png';
  articles: SearchResultDto[] = [];
  private topicsLoaded = false;
  private defaultTopicsLoaded = false;
  public twitterTabPreloaded: boolean = false;
  youtubeChannels: ChannelDto[] = [];
  xChannels: ChannelDto[] = [];
  selectedYouTubeChannel: string | null = null;
  selectedXChannel: string | null = null;
  showYoutubeTab: boolean = true;
  showTwitterTab: boolean = true;
  private logoutSubscription: Subscription | null = null;
  currentPage: { [key: string]: number } = { youtube: 1, twitter: 1 };
  itemsPerPage = 3;
  displayedArticles: { [key: string]: SearchResultDto[] } = { youtube: [], twitter: [] };
  isLoading = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private searchResultService: SearchResultService,
    private userService: UserService,
    private topicService: TopicService,
    private defaultTopicService: DefaultTopicService,
    private channelService: ChannelService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private toastr: ToastrService,
    private noteService: NoteService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.initializeComponent();
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadUserSpecificData();
      this.loadAllArticles();
      this.loadChannels();
    });

    this.logoutSubscription = this.userService.logout$.subscribe(() => {
      this.handleLogout();
    });
  }

  private initializeComponent() {
    this.initVideoModal();
    this.loadTwitterWidget();
    this.initNoteModal();
    this.activeTab = 'youtube';
    // Remove this.loadAllArticles() from here
  }

  private loadUserSpecificData() {
    this.loadTopics();
    this.loadDefaultTopics();
  }

  loadAllArticles() {
    const userId = this.currentUser?.id || '';
    const isHomePage = !userId;
    const request = {
      userId: userId,
      isHomePage: isHomePage
    };

      const headers = new HttpHeaders().set('Cache-Control', 'max-age=3600');

    this.searchResultService.getSearchResults(request, { headers }).subscribe({
      next: (results) => {
        this.allArticles = results;
        this.filterArticles();
      },
      error: (error) => {
        console.error('Error fetching search results:', error);
        this.toastr.error('Error loading articles');
      }
    });
  }

  private selectInitialTopic() {
    if (this.topics.length > 0) {
      this.selectedTopic = this.topics[0].term;
    } else if (this.defaultTopics.length > 0) {
      this.selectedDefaultTopic = this.defaultTopics[0].term;
    }
  }

  private checkAndSelectInitialTopic() {
    if (this.topicsLoaded && this.defaultTopicsLoaded) {
      this.selectInitialTopic();
      this.filterArticles();
    }
  }

  filterArticles() {
    const term = this.selectedTopic || this.selectedDefaultTopic || '';
    const youtubeChannel = this.selectedYouTubeChannel;
    const xChannel = this.selectedXChannel;

    // console.log("Youtube Channel:", youtubeChannel);
    // console.log("X Channel:", xChannel);
    // console.log("Term:", term);

    this.filteredArticles = this.allArticles.filter(article => {
      // console.log("Article:", article.channelName);
      const termMatch = !term || article.term.toLowerCase() === term.toLowerCase();
      const channelMatch = (!youtubeChannel && !xChannel) ||
        (youtubeChannel && article.contentTypeId === 2 && article.isChannel && article.term === youtubeChannel) ||
        (xChannel && article.contentTypeId === 1 && article.isChannel && article.term === xChannel);
      return termMatch && channelMatch;
    });

    this.currentPage = { youtube: 1, twitter: 1 };
    this.displayedArticles = { youtube: [], twitter: [] };
    this.loadMoreArticles('youtube');
    this.loadMoreArticles('twitter');
  }

  onYouTubeChannelChange() {
    this.selectedTopic = null;
    this.selectedDefaultTopic = null;
    this.selectedXChannel = null;
    this.activeTab = 'youtube';
    this.showYoutubeTab = true;
    this.showTwitterTab = false;
    // console.log("Selected YouTube Channel:", this.selectedYouTubeChannel);
    this.filterArticles();
  }

  onXChannelChange() {
    this.selectedTopic = null;
    this.selectedDefaultTopic = null;
    this.selectedYouTubeChannel = null;
    this.activeTab = 'twitter';
    this.showYoutubeTab = false;
    this.showTwitterTab = true;
    // console.log("Selected X Channel:", this.selectedXChannel);
    this.filterArticles();
    this.renderTweets();
  }

  onTopicChange() {
    this.selectedDefaultTopic = null;
    this.selectedYouTubeChannel = null;
    this.selectedXChannel = null;
    this.activeTab = 'youtube';
    this.showYoutubeTab = true;
    this.showTwitterTab = true;
    this.filterArticles();
  }

  onDefaultTopicChange() {
    this.selectedTopic = null;
    this.selectedYouTubeChannel = null;
    this.selectedXChannel = null;
    this.activeTab = 'youtube';
    this.showYoutubeTab = true;
    this.showTwitterTab = true;
    this.filterArticles();
  }

  ngAfterViewInit() {
    this.loadTwitterWidget();
    this.renderTweets();
  }

  private initVideoModal() {
    const modalElement = document.getElementById('videoModal');
    if (modalElement) {
      this.videoModal = new bootstrap.Modal(modalElement);
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
  }

  loadTopics() {
    if (this.currentUser?.id) {
      this.topicService.getTopics({ userId: this.currentUser.id }).subscribe({
        next: (topics: TopicDto[]) => {
          this.topics = topics;
          this.topicsLoaded = true;
          this.checkAndSelectInitialTopic();
        },
        error: (error) => {
          console.error('Error fetching topics:', error);
          this.topicsLoaded = true;
          this.checkAndSelectInitialTopic();
        }
      });
    } else {
      this.topics = [];
      this.topicsLoaded = true;
      this.checkAndSelectInitialTopic();
    }
  }

  loadDefaultTopics() {
    this.defaultTopicService.getDefaultTopics().subscribe({
      next: (defaultTopics: DefaultTopicDto[]) => {
        this.defaultTopics = defaultTopics;
        this.defaultTopicsLoaded = true;
        this.checkAndSelectInitialTopic();
      },
      error: (error) => {
        console.error('Error fetching default topics:', error);
        this.defaultTopicsLoaded = true;
        this.checkAndSelectInitialTopic();
      }
    });
  }

  setActiveTab(tab: 'youtube' | 'twitter') {
    if ((tab === 'youtube' && this.showYoutubeTab) || (tab === 'twitter' && this.showTwitterTab)) {
      this.activeTab = tab;
      if (tab === 'youtube' && !this.twitterTabPreloaded) {
        this.preloadTwitterTab();
      }
      if (tab === 'twitter') {
        this.renderTweets();
      }
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
      document.body.appendChild(script);
    }
  }

  renderTweets() {
    if ((window as any).twttr && (window as any).twttr.widgets) {
      (window as any).twttr.widgets.load();
    } else {
      setTimeout(() => this.renderTweets(), 100);
    }
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

    console.log("Toggling top result for article:", article.id, "New value:", article.topSearchResult);

    this.searchResultService.updateSearchResult(article).subscribe({
      next: (updatedArticle) => {
        console.log("API response:", updatedArticle);
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
    console.log("Opening note modal for article:", article);
    modalRef.componentInstance.searchResult = article;
    modalRef.componentInstance.currentUserId = this.currentUser?.id;
  }

  closeNoteModal() {
    this.selectedNoteArticle = null;
    if (this.noteModal) {
      this.noteModal.hide();
    }
  }

  saveNote() {
    console.log("Saving note:", this.selectedNoteArticle);
    console.log("Current user:", this.currentUser);
    if (this.selectedNoteArticle && this.currentUser) {
      const note: Omit<NoteDto, 'id'> = {
        userId: this.currentUser.id,
        title: this.noteTitle,
        message: this.noteMessage,
        searchResultId: this.selectedNoteArticle.id,
      };

      console.log("Saving note:", note);
      this.noteService.createNote(note).subscribe({
        next: () => {
          this.toastr.success('Note added successfully');
          this.closeNoteModal();
        },
        error: (error) => {
          console.error('Error adding note:', error);
          this.toastr.error('Error adding note');
        }
      });
    }
  }

  private initNoteModal() {
    const modalElement = document.getElementById('noteModal');
    if (modalElement) {
      this.noteModal = new bootstrap.Modal(modalElement);
    }
  }

  private preloadTwitterTab() {
    // This method will load the Twitter content in the background
    setTimeout(() => {
      this.twitterTabPreloaded = true;
      this.renderTweets();
    }, 0);
  }

  private loadChannels() {
    if (this.currentUser?.id) {
      const request = { userId: this.currentUser.id };
      this.channelService.getChannels(request).subscribe({
        next: (channels: ChannelDto[]) => {
          this.youtubeChannels = channels.filter(channel => channel.contentTypeId === 2);
          this.xChannels = channels.filter(channel => channel.contentTypeId === 1);
        },
        error: (error) => {
          console.error('Error fetching channels:', error);
          this.toastr.error('Error loading channels');
        }
      });
    }
  }

  private handleLogout() {
    this.selectedTopic = null;
    this.selectedYouTubeChannel = null;
    this.selectedXChannel = null;
    this.showYoutubeTab = true;
    this.showTwitterTab = true;
    this.activeTab = 'youtube';

    // Select the first default topic
    if (this.defaultTopics.length > 0) {
      this.selectedDefaultTopic = this.defaultTopics[0].term;
    } else {
      this.selectedDefaultTopic = null;
    }

    this.filterArticles();
  }

  loadMoreArticles(contentType: 'youtube' | 'twitter') {
    if (this.isLoading) return;

    this.isLoading = true;
    const startIndex = (this.currentPage[contentType] - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    const filteredByType = this.filteredArticles.filter(article =>
      (contentType === 'youtube' && article.contentTypeId === 2) ||
      (contentType === 'twitter' && article.contentTypeId === 1)
    );

    const newArticles = filteredByType.slice(startIndex, endIndex);
    this.displayedArticles[contentType] = [...this.displayedArticles[contentType], ...newArticles];
    this.currentPage[contentType]++;
    this.isLoading = false;
  }

  onScroll(contentType: 'youtube' | 'twitter') {
    this.loadMoreArticles(contentType);
  }

  shouldShowDeleteOption(article: SearchResultDto): boolean {
    // If it's a user-specific topic/channel, always show the delete option
    if (this.selectedTopic || this.selectedYouTubeChannel || this.selectedXChannel) {
      return true;
    }
    
    // If it's a default topic, only show the delete option for admin users
    if (this.selectedDefaultTopic) {
      return this.currentUser?.isAdmin === true;
    }
    
    // Default case - don't show delete option
    return false;
  }

  markForDeletion(article: SearchResultDto) {
    if (confirm('Are you sure you want to remove this search result?')) {
      // Call the service to delete the search result
      this.searchResultService.deleteSearchResult(article.id).subscribe({
        next: () => {
          // Remove from local arrays after successful deletion
          this.allArticles = this.allArticles.filter(a => a.id !== article.id);
          this.filteredArticles = this.filteredArticles.filter(a => a.id !== article.id);
          
          if (article.contentTypeId === 2) {
            this.youtubeArticles = this.youtubeArticles.filter(a => a.id !== article.id);
            this.displayedArticles['youtube'] = this.displayedArticles['youtube'].filter(a => a.id !== article.id);
          } else if (article.contentTypeId === 1) {
            this.twitterArticles = this.twitterArticles.filter(a => a.id !== article.id);
            this.displayedArticles['twitter'] = this.displayedArticles['twitter'].filter(a => a.id !== article.id);
          }
          
          this.toastr.success('Search result removed successfully');
        },
        error: (error) => {
          console.error('Error removing search result:', error);
          this.toastr.error('Error removing search result');
        }
      });
    }
  }
}
