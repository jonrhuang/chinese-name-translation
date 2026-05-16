// chinese-char.component.ts
import { Component, AfterViewInit, OnChanges, ElementRef, Input, ViewChild, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import HanziWriter from 'hanzi-writer';

@Component({
  selector: 'app-chinese-char',
  templateUrl: './character.component.html',
  styleUrl: './character.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChineseCharComponent implements AfterViewInit, OnChanges {
  @Input() pinyin: string = "pinyin";
  @Input() character: string = '学';
  @ViewChild('writerTarget') target!: ElementRef;
  private writer: any;

  ngAfterViewInit() {
    this.initializeWriter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['character'] && this.target) {
      this.initializeWriter();
    }
  }

  private initializeWriter() {
    if (this.target && this.character) {
      // Clear any existing writer
      if (this.writer) {
        this.target.nativeElement.innerHTML = '';
      }
      
      this.writer = HanziWriter.create(this.target.nativeElement, this.character, {
        width: 200,
        height: 200,
        // padding: 4,
        showOutline: true,
      });
      //this.writer.animateCharacter();
    }
  }

  onClick() {
    this.writer.animateCharacter();
  }
}