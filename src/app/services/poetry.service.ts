import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Poem } from '../models/poem.interface';

@Injectable({
  providedIn: 'root'
})
export class PoetryService {
  private http = inject(HttpClient);
  private apiUrl = 'https://poetrydb.org';

  /**
   * Search for poems by author name
   */
  searchByAuthor(author: string): Observable<Poem[]> {
    const url = `${this.apiUrl}/author/${encodeURIComponent(author)}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        // API returns 200 with {"status":404,"reason":"Not found"} when nothing found
        if (response && typeof response === 'object' && 'status' in response) {
          return [] as Poem[];
        }
        // Return array of poems (even if empty)
        return Array.isArray(response) ? response : [];
      }),
      catchError((error) => {
        return throwError(() => new Error(`Failed to fetch poems by author: ${error.message}`));
      })
    );
  }

  /**
   * Search for poems by title name
   */
  searchByTitle(title: string): Observable<Poem[]> {
    const url = `${this.apiUrl}/title/${encodeURIComponent(title)}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        // API returns 200 with {"status":404,"reason":"Not found"} when nothing found
        if (response && typeof response === 'object' && 'status' in response) {
          return [] as Poem[];
        }
        // Return array of poems (even if empty)
        return Array.isArray(response) ? response : [];
      }),
      catchError((error) => {
        return throwError(() => new Error(`Failed to fetch poems by title: ${error.message}`));
      })
    );
  }

  /**
   * Search for poems by both author and title, combining results
   */
  searchByAuthorAndTitle(author: string, title: string): Observable<Poem[]> {
    return forkJoin({
      byAuthor: this.searchByAuthor(author).pipe(catchError(() => of([] as Poem[]))),
      byTitle: this.searchByTitle(title).pipe(catchError(() => of([] as Poem[])))
    }).pipe(
      map(({ byAuthor, byTitle }) => {
        // Combine and deduplicate results based on title and author
        const allPoems = [...byAuthor, ...byTitle];
        const uniquePoems = new Map<string, Poem>();
        allPoems.forEach(poem => {
          const key = `${poem.title}-${poem.author}`;
          if (!uniquePoems.has(key)) {
            uniquePoems.set(key, poem);
          }
        });
        return Array.from(uniquePoems.values());
      })
    );
  }

  /**
   * Unified search that queries both author and title endpoints
   */
  search(query: string): Observable<Poem[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    const trimmedQuery = query.trim();
    return forkJoin({
      byAuthor: this.searchByAuthor(trimmedQuery).pipe(catchError(() => of([] as Poem[]))),
      byTitle: this.searchByTitle(trimmedQuery).pipe(catchError(() => of([] as Poem[])))
    }).pipe(
      map(({ byAuthor, byTitle }) => {
        // Combine and deduplicate results
        const allPoems = [...byAuthor, ...byTitle];
        const uniquePoems = new Map<string, Poem>();
        allPoems.forEach(poem => {
          const key = `${poem.title}-${poem.author}`;
          if (!uniquePoems.has(key)) {
            uniquePoems.set(key, poem);
          }
        });
        return Array.from(uniquePoems.values());
      }),
      catchError((error) => {
        return throwError(() => new Error(`Search failed: ${error.message}`));
      })
    );
  }
}

