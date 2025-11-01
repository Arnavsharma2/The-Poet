import { Component, Input, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Poem } from '../../models/poem.interface';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-poem-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poem-card.component.html',
  styleUrl: './poem-card.component.css'
})
export class PoemCardComponent {
  @Input() poem?: Poem;
  @Input() searchTerm: string = '';
  @Input() geminiApiKey: string = '';
  
  private geminiService = inject(GeminiService);
  private destroyRef = inject(DestroyRef);
  
  isExpanded: boolean = false;
  isReadingMode: boolean = false;
  showSummary: boolean = false;
  summary: string = '';
  isLoadingSummary: boolean = false;
  summaryError: string = '';

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded) {
      this.isReadingMode = false;
    }
  }

  toggleReadingMode(): void {
    if (this.isExpanded) {
      this.isReadingMode = !this.isReadingMode;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  highlightText(text: string): string {
    if (!this.searchTerm || !text) {
      return text;
    }
    const regex = new RegExp(`(${this.searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  getPreviewLines(): string {
    if (!this.poem || !this.poem.lines) {
      return '';
    }
    // Get first 3-4 non-empty lines for preview
    const nonEmptyLines = this.poem.lines.filter(line => line && line.trim().length > 0);
    const previewCount = Math.min(3, nonEmptyLines.length);
    return nonEmptyLines.slice(0, previewCount).join(' • ');
  }

  toggleSummary(): void {
    if (this.showSummary) {
      this.showSummary = false;
      this.summary = '';
      this.summaryError = '';
    } else {
      this.showSummary = true;
      if (!this.summary && !this.isLoadingSummary && !this.summaryError) {
        this.generateSummary();
      }
    }
  }

  generateSummary(): void {
    if (!this.poem || !this.geminiApiKey) {
      this.summaryError = this.geminiApiKey ? 'Unable to generate summary' : 'Gemini API key not configured';
      return;
    }

    this.isLoadingSummary = true;
    this.summaryError = '';

    this.geminiService.generateSummary(this.poem, this.geminiApiKey)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.isLoadingSummary = false;
        },
        error: (error) => {
          this.summaryError = error instanceof Error ? error.message : 'Failed to generate summary';
          this.isLoadingSummary = false;
        }
      });
  }
}

