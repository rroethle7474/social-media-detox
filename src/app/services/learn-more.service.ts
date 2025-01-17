import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';
import { QuoteDto } from '../models/Dtos/quote.dto';
import { StoredQuoteData } from '../models/Dtos/stored-quote-data.dto';
import { LearnMoreDto } from '../models/Dtos/learn-more-dto';

@Injectable({
  providedIn: 'root'
})
export class LearnMoreService extends BaseDopamineDetoxApiService {
  private readonly LEARN_MORE_STORAGE_KEY = 'learn_more';
  private readonly MAX_RETRIES = 3;

  constructor(http: HttpClient) {
    super(http);
  }

  getLearnMoreContent(): Observable<LearnMoreDto> {
    try {
      const storedLearnMoreContent = this.getStoredLearnMoreContent();
      if (storedLearnMoreContent && this.isLearnMoreContentValid(storedLearnMoreContent.quoteDateFetched)) {
        return of(storedLearnMoreContent);
      }
    } catch (error) {
      console.error('Error reading stored learn more:', error);
      localStorage.removeItem(this.LEARN_MORE_STORAGE_KEY);
    }

    return this.fetchLearnMoreContent();
  }

  private fetchLearnMoreContent(): Observable<LearnMoreDto> {
    return this.http.get<LearnMoreDto>(
      `${this.API_BASE_URL}/Quote/learn-more`,
      {
        headers: {
          'X-Skip-Cache': 'true'
        }
      }
    ).pipe(
      retry(this.MAX_RETRIES),
      map(response => {
        console.log('Raw response:', response);
        if (!response || !response.introduction || !response.items) {
          throw new Error('Invalid learn more response');
        }

        try {
          const storedLearnMore: LearnMoreDto = {
            introduction: response.introduction,
            items: response.items,
            quoteDateFetched: new Date().toISOString()
          };
            this.saveLearnMoreContentToStorage(storedLearnMore);
            return storedLearnMore;
        } catch (error) {
          console.error('Error processing learn more data:', error);
          throw error;
        }
      }),
      catchError(error => {
        console.error('Error fetching learn more:', error);
        const fallbackLearnMore = this.getFallbackLearnMoreContent();
        this.saveLearnMoreContentToStorage(fallbackLearnMore);
        return of(fallbackLearnMore);
      })
    );
  }

  private saveLearnMoreContentToStorage(learnMoreData: LearnMoreDto): void {
    try {
      localStorage.setItem(this.LEARN_MORE_STORAGE_KEY, JSON.stringify(learnMoreData));
    } catch (error) {
      console.error('Error saving learn more to storage:', error);
    }
  }

  private getStoredLearnMoreContent(): LearnMoreDto | null {
    try {
      const stored = localStorage.getItem(this.LEARN_MORE_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (!parsed.introduction || !parsed.items || !parsed.quoteDateFetched) return null;

      return parsed as LearnMoreDto;
    } catch (error) {
      console.error('Error parsing stored quote:', error);
      return null;
    }
  }

  private isLearnMoreContentValid(timestamp: string): boolean {
    try {
      const lm_date = new Date(timestamp);
      const today = new Date();
      return lm_date.toDateString() === today.toDateString();
    } catch (error) {
      console.error('Error validating learn more timestamp:', error);
      return false;
    }
  }

  private getFallbackLearnMoreContent(): LearnMoreDto {
    return {
      introduction: 'Dr. Andrew Huberman studies some of the ways that the brain works, and he is famous for his research in neuroscience and ophthalmology. His work can be used to shed light on the neurological impacts of excessive social media usage. Social media platforms are designed to trigger reactions in our brains, releasing dopamine that can lead to addiction. Excessive use can lead to a myriad of psychological issues like anxiety, depression, and even changes in human behavior patterns.',
      items: `Impacts on Sleep Patterns || Social Media Anxiety || Reinforced Negative Self-Perception || Increased Risk of Depression and Anxiety || Addiction to Validation

      Impacts on Sleep Patterns: According to Dr. Huberman, exposure to excessive screen time, especially before bedtime, affects the production of melatonin, a hormone that promotes sleep. This disruption of sleep patterns can lead to mental health issues like depression and anxiety.

      Social Media Anxiety: The fear of missing out, or FOMO, exacerbated by social media platforms, can become a cause for anxiety for many people. The constant feed of updates may cause people to feel like they’re not living up to the expectations or the lives of others, causing stress and anxiety.

      Reinforced Negative Self-Perception: Social media portrays largely edited, filtered, and often unrealistic versions of people's lives. Constant exposure to such content can reinforce negative self-perception and lower self-esteem

      Increased Risk of Depression and Anxiety: Studies have shown a strong link between heavy social media use and an increased risk for depression, anxiety, loneliness, self-harm, and even suicidal thoughts. This is in part due to the constant comparison to others and feelings of inadequacy that can come from these virtual interactions.

      Addiction to Validation: Social media platforms operate by reinforcing behavior through validation. Users often seek validation by way of "likes", "shares", and comments, which trigger dopamine release, similar to the mechanisms seen in other types of addiction.`,
      quoteDateFetched: new Date().toISOString()
    };
  }

}
