import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css'
})
export class SearchFormComponent {
  inputName = signal('');
  thinking = signal(false);
  
  onSearch = output<string>();

  onFind(): void {
    const trimmedName = this.inputName().trim();
    if (trimmedName) {
      this.thinking.set(true);
      this.onSearch.emit(trimmedName);
    }
  }

  setThinking(value: boolean): void {
    this.thinking.set(value);
  }

  clearInput(): void {
    this.inputName.set('');
  }
}
