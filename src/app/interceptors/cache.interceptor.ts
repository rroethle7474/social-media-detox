import { HttpInterceptorFn, HttpHandlerFn } from '@angular/common/http';
import { HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

const CACHE_KEY = 'httpCache';
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // console.log("Cache interceptor called");
  // console.log("Request method:", req.method);
  // console.log("Request URL:", req.url);
  // console.log("Request headers:", req.headers.keys());
  // console.log("Request body:", req.body);

  if (req.headers.get('X-Custom-Header') === 'SearchResults') {
    console.log("Handling search results request");
    const userId = req.headers.get('X-User-Id') || 'anonymous';
    return handleSearchResultsRequest(req, next, userId);
  }

  if (req.headers.get('X-Skip-Cache') === 'true') {
    console.log("Skipping cache due to X-Skip-Cache header");
    return next(req);
  }

  const userId = req.headers.get('X-User-Id') || 'anonymous';

  if (req.method === 'POST' && req.url.includes('/SearchResult/search')) {
    // console.log("Handling search results request");
    return handleSearchResultsRequest(req, next, userId);
  }

  if (req.method !== 'GET') {
    // console.log("Non-GET request, passing through");
    return next(req);
  }

  const cacheKey = getCacheKey(req, userId);
  const cache = getCache();

  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
    return of(new HttpResponse({ body: cachedResponse.data }));
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(cacheKey, { data: event.body, timestamp: Date.now() });
        setCache(cache);
      }
    })
  );
};

function handleSearchResultsRequest(req: HttpRequest<any>, next: HttpHandlerFn, userId: string): Observable<HttpEvent<any>> {
  const cache = getCache();
  const cacheKey = getSearchResultsCacheKey(req, userId);
  // console.log('Cache key:', cacheKey);
  const cachedResponse = cache.get(cacheKey);
  // console.log('Cached response:', cachedResponse);

  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
    // console.log("Returning cached response for:", cacheKey);
    return of(new HttpResponse({ body: cachedResponse.data }));
  }

  // console.log("No valid cache found, proceeding with request");
  return next(req).pipe(
    tap(event => {
      console.log("Received response from server");
      if (event instanceof HttpResponse) {
        console.log("Caching response for:", cacheKey);
        cache.set(cacheKey, { data: event.body, timestamp: Date.now() });
        setCache(cache);
      }
    })
  );
}

function getSearchResultsCacheKey(req: HttpRequest<any>, userId: string): string {
  let body: any;
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      body = req.body;
    }
  } else {
    body = req.body;
  }
  return `${req.url}_${userId}_${JSON.stringify(body)}`;
}

function getCacheKey(req: HttpRequest<any>, userId: string): string {
  return `${req.url}_${userId}_${req.params.toString()}`;
}

function invalidateCache(key: string): void {
  const cache = getCache();
  cache.delete(key);
  setCache(cache);
}

function getCache(): Map<string, { data: any, timestamp: number }> {
  console.log("HERE CACHE", CACHE_KEY);
  const cache = sessionStorage.getItem(CACHE_KEY);
  return cache ? new Map(JSON.parse(cache)) : new Map();
}

function setCache(cache: Map<string, { data: any, timestamp: number }>) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cache.entries())));
}

export function clearCache(): void {
  sessionStorage.removeItem(CACHE_KEY);
}
