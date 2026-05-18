import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../app';

@Component({
  selector: 'results-container',
  templateUrl: './results-container.component.html',
  styleUrl: './results-container.component.css',
})
export class ResultsContainerComponent {
  @Input() cards: Card[] = [];
  @Input() selectedCardId: number = 0;
  @Output() cardClicked = new EventEmitter<Card>();

  onCardClick(card: Card): void {
    this.cardClicked.emit(card);
  }
}