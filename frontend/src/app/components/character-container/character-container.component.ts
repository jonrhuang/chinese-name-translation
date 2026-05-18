import { Component, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterComponent } from '../character/character.component';
import { Writer } from '../../app';

@Component({
  selector: 'app-character-container',
  imports: [CommonModule, CharacterComponent],
  templateUrl: './character-container.component.html',
  styleUrl: './character-container.component.css'
})
export class CharacterContainerComponent {
  @Output() changeCharacter = new EventEmitter<{
    character: string;
    pinyin: string;
    definitions: string;
    index: number;
  }>();
  selectedCardWriter = input<Writer[] | null>(null);
}
