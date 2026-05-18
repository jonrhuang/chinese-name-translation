import { Component, input, Output, EventEmitter } from '@angular/core';
import { CharacterComponent } from '../character/character.component';
import { Writer } from '../../app';

@Component({
  selector: 'edit-container',
  imports: [CharacterComponent], 
  templateUrl: './edit-container.component.html',
  styleUrl: './edit-container.component.css',
})
export class EditContainerComponent {
  selectedCharWriter = input<Writer[] | null>(null);
  @Output() changeCharacter = new EventEmitter<{
    character: string;
    pinyin: string;
    definitions: string;
    index: number;
  }>();
}