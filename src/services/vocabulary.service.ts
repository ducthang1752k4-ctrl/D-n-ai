import { Injectable, signal } from '@angular/core';

export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  ipa?: string;
  example?: string;
  image?: string | null;
  
  // SRS Data
  interval: number; // Days until next review
  repetition: number; // Consecutive successful reviews
  easeFactor: number; // Difficulty multiplier (default 2.5)
  nextReview: number; // Timestamp
  state: 'new' | 'learning' | 'review' | 'relearning';
}

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {
  private readonly STORAGE_KEY = 'lingua_vocab_deck';
  
  cards = signal<Flashcard[]>([]);

  constructor() {
    this.loadCards();
  }

  addCards(newCards: Partial<Flashcard>[]) {
    const cardsToAdd: Flashcard[] = newCards.map(c => ({
      id: crypto.randomUUID(),
      word: c.word!,
      definition: c.definition || '',
      ipa: c.ipa || '',
      example: c.example || '',
      image: c.image || null,
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: Date.now(), // Due immediately
      state: 'new'
    }));

    this.cards.update(current => [...current, ...cardsToAdd]);
    this.saveCards();
  }

  deleteCard(id: string) {
    this.cards.update(current => current.filter(c => c.id !== id));
    this.saveCards();
  }

  /**
   * Process a card review using a simplified SM-2 Algorithm
   * rating: 0 (Again/Fail), 1 (Hard), 2 (Good), 3 (Easy)
   */
  processReview(cardId: string, rating: 0 | 1 | 2 | 3) {
    this.cards.update(allCards => {
      return allCards.map(card => {
        if (card.id !== cardId) return card;

        let { interval, repetition, easeFactor } = card;
        
        if (rating === 0) {
          // Reset
          repetition = 0;
          interval = 0; // Due today/minutes later
        } else {
          // Success
          if (repetition === 0) {
            interval = 1;
          } else if (repetition === 1) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
          repetition++;
        }

        // Adjust Ease Factor
        // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        // Here mapping 0-3 rating to SM-2's 0-5 scale logic roughly
        // Simplified:
        if (rating === 1) easeFactor = Math.max(1.3, easeFactor - 0.15);
        if (rating === 3) easeFactor += 0.15;

        // Calculate next date (Interval is in days)
        // If rating is 0 (Again), we technically want it in 1 minute, but for this app "Now" is fine.
        // If interval is 0, set to now + 1 min, else now + days
        const nextReviewDate = rating === 0 
          ? Date.now() + 60000 
          : Date.now() + (interval * 24 * 60 * 60 * 1000);

        return {
          ...card,
          interval,
          repetition,
          easeFactor,
          nextReview: nextReviewDate,
          state: rating === 0 ? 'relearning' : 'review'
        };
      });
    });
    this.saveCards();
  }

  getDueCards(): Flashcard[] {
    const now = Date.now();
    return this.cards().filter(c => c.nextReview <= now).sort((a,b) => a.nextReview - b.nextReview);
  }

  private saveCards() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cards()));
  }

  private loadCards() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.cards.set(JSON.parse(data));
    } else {
        // Seed initial data
        this.addCards([
            { word: "Serendipity", definition: "The occurrence of events by chance in a happy or beneficial way.", ipa: "/ˌser.ənˈdɪp.ə.ti/", example: "It was pure serendipity that we met." },
            { word: "Ephemeral", definition: "Lasting for a very short time.", ipa: "/ɪˈfem.ər.əl/", example: "Fashions are ephemeral, changing with every season." }
        ]);
    }
  }
}