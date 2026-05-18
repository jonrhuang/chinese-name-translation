// chinese-char.component.ts
import { Component, AfterViewInit, OnChanges, ElementRef, Input, Output, ViewChild, ChangeDetectionStrategy, SimpleChanges, EventEmitter, ChangeDetectorRef } from '@angular/core';
import HanziWriter from 'hanzi-writer';

@Component({
  selector: 'chinese-character',
  templateUrl: './character.component.html',
  styleUrl: './character.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterComponent implements AfterViewInit, OnChanges {
  @Input() pinyin: string = 'pinyin';
  @Input() character: string = '学';
  @Input() definitions: string = 'definition';
  @Input() button: string = 'Select';
  @Input() index: number = 0;
  @Output() changeCharacter = new EventEmitter<{
    character: string;
    pinyin: string;
    definitions: string;
    index: number;
  }>();
  @ViewChild('writerTarget') target!: ElementRef;

  private writer: any;
  hasStrokeData = true;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.initializeWriter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['character'] && this.target) {
      this.initializeWriter();
    }
  }

  private async initializeWriter() {
    if (!this.target?.nativeElement || 
      !this.character || !this.hasStrokeData) return;

    // Clear any existing writer
    this.target.nativeElement.innerHTML = '';

    try {
      await HanziWriter.loadCharacterData(this.character);

      this.hasStrokeData = true;
      this.cdr.markForCheck();

      this.writer = HanziWriter.create(
        this.target.nativeElement,
        this.character,
        {
          width: 200,
          height: 200,
          showOutline: true,
        });
    }
    catch (err) {
      this.hasStrokeData = false;
      this.cdr.markForCheck();
    }
  }

  onClick() {
    this.writer.animateCharacter();
  }

  onButtonClick() {
    this.changeCharacter.emit({
      character: this.character,
      pinyin: this.pinyin,
      definitions: this.definitions,
      index: this.index, 
    });
  }
}