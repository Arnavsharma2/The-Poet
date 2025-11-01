import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Poem } from '../../models/poem.interface';

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
  isExpanded: boolean = false;
  isReadingMode: boolean = false;

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
}

