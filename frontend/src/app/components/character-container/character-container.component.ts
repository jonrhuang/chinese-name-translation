import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChineseCharComponent } from '../character/character.component';

interface Writer {
  pinyin: string,
  character: string;
}

@Component({
  selector: 'app-character-container',
  imports: [CommonModule, ChineseCharComponent],
  templateUrl: './character-container.component.html',
  styleUrl: './character-container.component.css'
})
export class CharacterContainerComponent {
  selectedCard = input<Writer[] | null>(null);
}
