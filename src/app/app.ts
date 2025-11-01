import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './components/search/search.component';
import { PoemListComponent } from './components/poem-list/poem-list.component';
import { Poem } from './models/poem.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchComponent, PoemListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  poems: Poem[] = [];
  errorMessage: string = '';
  currentSearchTerm: string = '';

  onPoemsFound(data: { poems: Poem[]; searchTerm: string }): void {
    this.poems = data.poems;
    this.currentSearchTerm = data.searchTerm;
    this.errorMessage = '';
    
    // Smooth scroll to results after a brief delay for animation
    if (data.poems.length > 0) {
      setTimeout(() => {
        const poemList = document.querySelector('.poem-list-container');
        if (poemList) {
          poemList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }

  onSearchError(error: string): void {
    this.errorMessage = error;
    this.poems = [];
    this.currentSearchTerm = '';
  }
}
