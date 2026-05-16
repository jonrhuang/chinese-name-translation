import { Component, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChineseCharComponent } from './components/character/character.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { ResultsContainerComponent } from './components/results-container/results-container.component';
import { CharacterContainerComponent } from './components/character-container/character-container.component';


interface Card {
  id: number;
  name: string;
  pinyin: string;
  characters: string;
}

interface Writer {
  pinyin: string,
  character: string;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    ChineseCharComponent, 
    SearchFormComponent, 
    ResultsContainerComponent,
    CharacterContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('chinese-name-translator');
  cards = signal<Card[]>([]);
  selectedCard = signal<Writer[] | null>(null);
  
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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({name: name})
    });

    const data = await response.json();

    console.log(data)

    const newCard: Card = {
      id: Date.now(), 
      name: name,
      pinyin: data.pinyin,
      characters: data.characters
    };

    this.cards.update(current => [newCard, ...current]);
  }

  onCardClick(card: Card) {
    let writerList: Writer[] = [];
    const pinyinList = card.pinyin.split(" ");
    const characterList = card.characters.split("");
    for (const idx in characterList) {
      writerList[idx] = {pinyin: pinyinList[idx], character: characterList[idx]}
    }
    this.selectedCard.set(writerList);
  }
}
