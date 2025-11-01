import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoemCardComponent } from '../poem-card/poem-card.component';
import { Poem } from '../../models/poem.interface';

@Component({
  selector: 'app-poem-list',
  standalone: true,
  imports: [CommonModule, PoemCardComponent],
  templateUrl: './poem-list.component.html',
  styleUrl: './poem-list.component.css'
})
export class PoemListComponent {
  @Input() poems: Poem[] = [];
  @Input() searchTerm: string = '';
  @Input() geminiApiKey: string = '';

  trackByPoem(index: number, poem: Poem): string {
    return `${poem.title}-${poem.author}`;
  }
}

