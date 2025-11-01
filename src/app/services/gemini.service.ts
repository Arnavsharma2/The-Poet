import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Poem } from '../models/poem.interface';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);
  // Default API endpoint - can be configured
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  /**
   * Generate a summary for a poem using Gemini API
   */
  generateSummary(poem: Poem, apiKey: string): Observable<string> {
    if (!apiKey || apiKey.trim() === '') {
      return throwError(() => new Error('Gemini API key is required. Please configure it in your environment.'));
    }

    const poemText = poem.lines.filter(line => line && line.trim().length > 0).join('\n');
    const prompt = `Please provide a brief, insightful summary (2-3 sentences) of the following poem:\n\nTitle: ${poem.title}\nAuthor: ${poem.author}\n\n${poemText}`;

    const url = `${this.apiUrl}?key=${encodeURIComponent(apiKey)}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    return this.http.post<any>(url, body, { headers }).pipe(
      map((response) => {
        return this.extractSummaryText(response);
      }),
      catchError((error) => {
        if (error.status === 400) {
          return throwError(() => new Error('Invalid API key or request. Please check your Gemini API configuration.'));
        }
        if (error.status === 429) {
          return throwError(() => new Error('API rate limit exceeded. Please try again later.'));
        }
        return throwError(() => new Error(`Failed to generate summary: ${error.message || 'Unknown error'}`));
      })
    );
  }

  /**
   * Extract summary text from Gemini API response
   */
  extractSummaryText(response: any): string {
    try {
      if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text.trim();
      }
      throw new Error('Unexpected response format from Gemini API');
    } catch (error) {
      throw new Error('Failed to parse summary from API response');
    }
  }
}

