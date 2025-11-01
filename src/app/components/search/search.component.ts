import { Component, inject, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PoetryService } from '../../services/poetry.service';
import { Poem } from '../../models/poem.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnDestroy {
  private poetryService = inject(PoetryService);
  private destroy$ = new Subject<void>();
  
  @Output() poemsFound = new EventEmitter<{ poems: Poem[]; searchTerm: string }>();
  @Output() searchError = new EventEmitter<string>();
  
  searchQuery: string = '';
  isLoading: boolean = false;

  onSearch(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return;
    }

    this.isLoading = true;
    this.searchError.emit(''); // Clear previous errors

    const searchTerm = this.searchQuery.trim();
    this.poetryService.search(searchTerm).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (poems: Poem[]) => {
        this.isLoading = false;
        this.poemsFound.emit({ poems, searchTerm });
      },
      error: (err: unknown) => {
        this.isLoading = false;
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        this.searchError.emit(errorMessage);
        this.poemsFound.emit({ poems: [], searchTerm: '' }); // Emit empty array on error
      }
    });
  }

  onClear(): void {
    this.searchQuery = '';
    this.poemsFound.emit({ poems: [], searchTerm: '' });
    this.searchError.emit('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

