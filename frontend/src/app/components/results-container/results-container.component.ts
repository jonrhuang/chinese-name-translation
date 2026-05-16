import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Card {
  id: number;
  name: string;
  pinyin: string;
  characters: string;
}

@Component({
  selector: 'results-container',
  templateUrl: './results-container.component.html',
  styleUrl: './results-container.component.css',
})
export class ResultsContainerComponent {
  @Input() cards: Card[] = [];
  @Output() cardClicked = new EventEmitter<Card>();

  onCardClick(card: Card): void {
    this.cardClicked.emit(card);
  }
}