import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { BaseDopamineDetoxApiService } from './base-dopamine-detox-api.service';
import { QuoteDto } from '../models/Dtos/quote.dto';
import { StoredQuoteData } from '../models/Dtos/stored-quote-data.dto';

@Injectable({
  providedIn: 'root'
})
export class QuoteService extends BaseDopamineDetoxApiService {
  private readonly QUOTE_STORAGE_KEY = 'daily_quote';
  private readonly MAX_RETRIES = 3;

  constructor(http: HttpClient) {
    super(http);
  }

  getDailyQuote(): Observable<StoredQuoteData> {
    try {
      console.log('PLEASE FETCH THIS STORED QUOTE');
      const storedQuote = this.getStoredQuote();
      if (storedQuote && this.isQuoteValid(storedQuote.timestamp)) {
        return of(storedQuote);
      }
    } catch (error) {
      console.error('Error reading stored quote:', error);
      localStorage.removeItem(this.QUOTE_STORAGE_KEY);
    }

    return this.fetchNewQuote();
  }

  private fetchNewQuote(): Observable<StoredQuoteData> {
    console.log('PLEASE FETCH THIS NEW QUTOE');
    return this.http.get<QuoteDto>(
      `${this.API_BASE_URL}/Quote/daily`,
      {
        headers: {
          'X-Skip-Cache': 'true'
        }
      }
    ).pipe(
      retry(this.MAX_RETRIES),
      map(response => {
        console.log('Raw response:', response);
        if (!response || !response.quoteImage || !response.quoteText) {
          throw new Error('Invalid quote response');
        }

        try {
          const base64String = this.byteArrayToBase64(response.quoteImage);
          const imageUrl = `data:image/png;base64,${base64String}`;

          const storedData: StoredQuoteData = {
            quote: response.quoteText,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString()
          };

          if (this.isValidImageUrl(imageUrl)) {
            this.saveQuoteToStorage(storedData);
            return storedData;
          } else {
            throw new Error('Invalid image data');
          }
        } catch (error) {
          console.error('Error processing quote data:', error);
          throw error;
        }
      }),
      catchError(error => {
        console.log('ERROR FETCHING QUOTE');
        console.error('Error fetching quote:', error);
        const fallbackQuote = this.getFallbackQuote();
        this.saveQuoteToStorage(fallbackQuote);
        return of(fallbackQuote);
      })
    );
  }

  private saveQuoteToStorage(quoteData: StoredQuoteData): void {
    try {
      localStorage.setItem(this.QUOTE_STORAGE_KEY, JSON.stringify(quoteData));
    } catch (error) {
      console.error('Error saving quote to storage:', error);
    }
  }

  private getStoredQuote(): StoredQuoteData | null {
    try {
      const stored = localStorage.getItem(this.QUOTE_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (!parsed.imageUrl || !parsed.quote || !parsed.timestamp) return null;

      return parsed as StoredQuoteData;
    } catch (error) {
      console.error('Error parsing stored quote:', error);
      return null;
    }
  }

  private isQuoteValid(timestamp: string): boolean {
    try {
      const quoteDate = new Date(timestamp);
      const today = new Date();
      return quoteDate.toDateString() === today.toDateString();
    } catch (error) {
      console.error('Error validating quote timestamp:', error);
      return false;
    }
  }

  private getFallbackQuote(): StoredQuoteData {
    return {
      quote: 'Embrace the strength within you, not wifi signals; thrive in life\'s real moments, not digital memories.',
      imageUrl: 'assets/default_image.png',
      timestamp: new Date().toISOString()
    };
  }

  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    if (url.startsWith('data:image')) {
      const base64Regex = /^data:image\/(png|jpg|jpeg);base64,([A-Za-z0-9+/=])+$/;
      return base64Regex.test(url);
    }
    return true;
  }

  private byteArrayToBase64(bytes: any): string {
    try {
      if (typeof bytes === 'string') {
        return bytes;
      }

      if (Array.isArray(bytes)) {
        const binary = bytes.map(byte => String.fromCharCode(byte)).join('');
        return btoa(binary);
      }

      if (bytes instanceof Uint8Array || bytes.buffer) {
        const binary = Array.from(bytes)
          .map(byte => String.fromCharCode(byte as number))
          .join('');
        return btoa(binary);
      }

      console.error('Unexpected byte array format:', bytes);
      throw new Error('Unsupported byte array format');
    } catch (error) {
      console.error('Error converting bytes to base64:', error);
      throw error;
    }
  }
}
