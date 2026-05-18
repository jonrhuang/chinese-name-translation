import { Component, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { ResultsContainerComponent } from './components/results-container/results-container.component';
import { CharacterContainerComponent } from './components/character-container/character-container.component';
import { EditContainerComponent } from "./components/edit-container/edit-container.component";


export interface Card {
  id: number;
  name: string;
  pinyin: string;
  translation: string;
  character_count: number;
  definitions: string[][];
  characters: CharactersRes[];
}

interface CharactersRes {
  pinyin: string;
  translations: TranslationsRes[];
}

interface TranslationsRes {
  simplified: string;
  pinyin: string;
  definition: string[];
}

export interface Writer {
  id: string;
  pinyin: string,
  character: string;
  definitions: string;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    SearchFormComponent,
    ResultsContainerComponent,
    CharacterContainerComponent,
    EditContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('chinese-name-translator');
  cards = signal<Card[]>([]);
  selectedCardWriter = signal<Writer[] | null>(null);
  selectedCardId: number = 0;
  changeOptions = signal<Writer[] | null>(null);
  changeIndex: number = 0;

  searchForm = viewChild(SearchFormComponent);

  async onFind(name: string) {
    const searchForm = this.searchForm();
    if (searchForm) {
      searchForm.setThinking(true);
    }

    await this.callApi(name);

    if (searchForm) {
      searchForm.setThinking(false);
      searchForm.clearInput();
    }
  }

  private async callApi(name: string) {
    const endpoint = "http://localhost:8000/translate"
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
      }

      const data = await response.json();

      console.log(data);

      const newCard: Card = {
        id: Date.now(),
        name: name,
        pinyin: data.pinyin,
        translation: data.initial_translation,
        character_count: data.character_count,
        definitions: data.definitions,
        characters: data.characters
      };

      this.cards.update(current => [newCard, ...current]);
    } catch (err) {
      console.log(err);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  onCardClick(card: Card) {
    let writerList: Writer[] = [];
    const pinyinList = card.pinyin.split(" ");
    const characterList = card.translation.split("");
    const definitionList = card.definitions;
    for (const idx in characterList) {
      writerList[idx] = {
        id: crypto.randomUUID(), 
        pinyin: pinyinList[idx],
        character: characterList[idx],
        definitions: definitionList[idx].join("; ")
      };
    }
    this.selectedCardWriter.set(writerList);
    this.selectedCardId = card.id;
    this.changeOptions.set([]);
  }

  changeCharacter(event: { 
    character: string; 
    pinyin: string; 
    definitions: string; 
    index: number;
  }) {
    const currentCard = this.cards().find(card => card.id === this.selectedCardId);
    if (currentCard === undefined) return;
    const idx = event.index;
    const optionsList = currentCard.characters[idx].translations;
    let writerList: Writer[] = [];
    for (const idx in optionsList) {
      writerList[idx] = {
        id: crypto.randomUUID(), 
        pinyin: optionsList[idx].pinyin,
        character: optionsList[idx].simplified,
        definitions: optionsList[idx].definition.join(": ")
      };
    }

    this.changeOptions.set(writerList);
    this.changeIndex = idx;
  }

  editCharacter(event: {
  character: string;
  pinyin: string;
  definitions: string;
  index: number;
}) {

  const currentCard =
    this.cards().find(card => card.id === this.selectedCardId);

  if (!currentCard) return;

  const idx = this.changeIndex;

  // ---------- update selected writer ----------
  const currentWriter = this.selectedCardWriter();

  if (!currentWriter) return;

  const updatedWriter = currentWriter.map((writer, i) => {

    if (i !== idx) {
      return writer;
    }

    return {
      ...writer,
      character: event.character,
      pinyin: event.pinyin,
      definitions: event.definitions
    };
  });

  // update signal
  this.selectedCardWriter.set(updatedWriter);

  // ---------- rebuild card fields ----------
  const updatedCard: Card = {
    ...currentCard,

    translation:
      updatedWriter.map(w => w.character).join(''),

    pinyin:
      updatedWriter.map(w => w.pinyin).join(' '),

    definitions:
      updatedWriter.map(w => w.definitions.split('; '))
  };

  // ---------- update cards ----------
  this.cards.update(cards =>
    cards.map(card =>
      card.id === currentCard.id
        ? updatedCard
        : card
    )
  );
}

  // editCharacter(event: {
  //   character: string;
  //   pinyin: string;
  //   definitions: string;
  //   index: number;
  // }) {

  //   const currentCard = this.cards()
  //     .find(card => card.id === this.selectedCardId);

  //   if (!currentCard) return;

  //   const idx = this.changeIndex;

  //   console.log('hi1')
  //   // Update translation
  //   const translation = currentCard.translation.split('');
  //   translation[idx] = event.character;

  //   // Update pinyin
  //   const pinyin = currentCard.pinyin.split(' ');
  //   pinyin[idx] = event.pinyin;

  //   // Update definitions
  //   const definitions = [...currentCard.definitions];
  //   definitions[idx] = event.definitions.split('; ');

  //   // Create updated card
  //   const updatedCard: Card = {
  //     ...currentCard,
  //     translation: translation.join(''),
  //     pinyin: pinyin.join(' '),
  //     definitions: definitions as [string[]]
  //   };

  //   // Update cards signal
  //   this.cards.update(cards =>
  //     cards.map(card =>
  //       card.id === updatedCard.id ? updatedCard : card
  //     )
  //   );

  //   // Update selected card writer
  //   const updatedWriter: Writer[] = translation.map((char, i) => ({
  //     character: char,
  //     pinyin: pinyin[i],
  //     definitions: definitions[i].join('; ')
  //   }));

  //   this.selectedCardWriter.set(updatedWriter);
  //   console.log('hi');
  // }
}