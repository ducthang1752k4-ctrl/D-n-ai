import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { AudioService } from '../services/audio.service';
import { VocabularyService, Flashcard } from '../services/vocabulary.service';

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#F9FAFB] rounded-b-[32px] overflow-hidden">
      <!-- Top Navigation (Mint Breeze) -->
      <header class="bg-[#E0F7FA] px-6 py-5 flex justify-between items-center shrink-0 border-b border-[#B5EAD7]">
        <h2 class="text-2xl font-bold text-[#4B5EAA] flex items-center gap-3 font-display">
          <div class="p-2 bg-[#A8E6CF] text-[#4B5EAA] rounded-xl shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          Vocabulary
        </h2>
        <div class="flex bg-[#F9FAFB] p-1.5 rounded-full border border-[#B5EAD7]">
          <button (click)="viewMode.set('list')" 
             [class.bg-[#A8E6CF]]="viewMode() === 'list'" 
             [class.shadow-md]="viewMode() === 'list'"
             [class.text-[#4B5EAA]]="viewMode() === 'list'"
             class="px-6 py-2.5 rounded-full text-sm font-bold transition-all text-[#64748B] hover:bg-[#E0F7FA] font-display">My List</button>
          <button (click)="viewMode.set('study')" 
             [class.bg-[#A8E6CF]]="viewMode() === 'study'" 
             [class.shadow-md]="viewMode() === 'study'"
             [class.text-[#4B5EAA]]="viewMode() === 'study'"
             class="px-6 py-2.5 rounded-full text-sm font-bold transition-all text-[#64748B] hover:bg-[#E0F7FA] font-display">Flashcards</button>
          <button (click)="viewMode.set('create')" 
             [class.bg-[#A8E6CF]]="viewMode() === 'create'" 
             [class.shadow-md]="viewMode() === 'create'"
             [class.text-[#4B5EAA]]="viewMode() === 'create'"
             class="px-6 py-2.5 rounded-full text-sm font-bold transition-all text-[#64748B] hover:bg-[#E0F7FA] font-display">Create Set</button>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F9FAFB]">
        
        <!-- VIEW: CREATE (Peach Mint Serenity) -->
        @if (viewMode() === 'create') {
          <div class="max-w-4xl mx-auto bg-[#FFFCF2] rounded-[36px] p-8 shadow-sm border border-[#FFDAC1]">
            <div class="flex justify-between items-center mb-6">
               <h3 class="text-xl font-bold text-[#4B5EAA] font-display">Create New Flashcards</h3>
               <button (click)="magicFill()" [disabled]="isProcessing()" class="flex items-center gap-2 px-6 py-3 bg-[#A8E6CF] text-[#4B5EAA] hover:bg-[#B5EAD7] rounded-full font-bold transition-colors text-sm shadow-md">
                  @if(isProcessing()) { <span class="animate-spin h-4 w-4 border-2 border-[#4B5EAA] border-t-transparent rounded-full"></span> }
                  @else { <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> }
                  AI Magic Fill
               </button>
            </div>

            <div class="space-y-4">
              @for (row of creationRows; track $index) {
                <div class="group bg-white p-5 rounded-[28px] border border-[#FFDAC1] relative transition-all hover:shadow-md">
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div class="md:col-span-1 flex items-center justify-center text-[#A7C7E7] font-black md:border-r border-[#FFDAC1] md:pr-2 font-display text-lg">
                      {{ $index + 1 }}
                    </div>
                    <!-- Filled Text Field Style (Peach Cream Tint) -->
                    <div class="md:col-span-4 relative">
                      <div class="bg-[#FFDAC1]/20 rounded-2xl px-5 pt-6 pb-3 hover:bg-[#FFDAC1]/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#A7C7E7] transition-all">
                          <label class="absolute left-5 top-2.5 text-[10px] font-black text-[#A7C7E7] uppercase tracking-wide">Term</label>
                          <input type="text" [(ngModel)]="row.word" class="w-full bg-transparent border-none outline-none text-[#4B5EAA] text-lg font-serif font-bold placeholder-transparent" placeholder="Term">
                      </div>
                    </div>
                    <div class="md:col-span-7 relative">
                       <div class="bg-[#FFDAC1]/20 rounded-2xl px-5 pt-6 pb-3 hover:bg-[#FFDAC1]/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#A7C7E7] transition-all">
                          <label class="absolute left-5 top-2.5 text-[10px] font-black text-[#A7C7E7] uppercase tracking-wide">Definition</label>
                          <input type="text" [(ngModel)]="row.definition" class="w-full bg-transparent border-none outline-none text-[#4B5EAA] text-lg font-serif placeholder-transparent" placeholder="Definition">
                      </div>
                    </div>
                  </div>
                  <!-- Delete Icon -->
                  <button (click)="removeRow($index)" class="absolute -right-2 -top-2 bg-[#FFE4E1] text-[#4B5EAA] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              }
            </div>

            <div class="mt-8 flex justify-between">
              <button (click)="addRow()" class="px-8 py-3.5 border-2 border-[#A7C7E7] text-[#4B5EAA] font-bold rounded-full hover:bg-[#F0F9FF] transition-colors font-display">
                + Add Card
              </button>
              <button (click)="saveSet()" class="px-10 py-3.5 bg-[#A7C7E7] hover:bg-[#4B5EAA] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all font-display">
                Save Deck
              </button>
            </div>
          </div>
        }

        <!-- VIEW: STUDY (Butter Yellow - Set 3) -->
        @if (viewMode() === 'study') {
          <div class="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
            @if (studyQueue().length > 0) {
              <!-- Progress Indicator -->
              <div class="w-full mb-6 flex items-center justify-between text-[#A7C7E7] text-sm font-bold font-display">
                <span>{{ currentCardIndex + 1 }} / {{ studyQueue().length }}</span>
                <span class="text-[#4B5EAA] bg-[#B5EAD7] px-4 py-1.5 rounded-full text-xs border border-[#A8E6CF]">Reviewing</span>
              </div>

              <!-- Card Container -->
              <div class="perspective w-full h-[450px] cursor-pointer group" (click)="flipCard()">
                <div class="card-inner relative w-full h-full text-center transition-transform duration-500 transform-style-3d shadow-[0_12px_40px_rgb(0,0,0,0.08)] rounded-[40px]" [class.rotate-y-180]="isFlipped">
                  
                  <!-- FRONT (Butter Yellow Fresh) -->
                  <div class="card-front absolute w-full h-full backface-hidden bg-[#FFF5BA] rounded-[40px] flex flex-col items-center justify-center p-8 border border-[#D9E8D8] relative overflow-hidden">
                     <!-- Decorative corner (Mint) -->
                     <div class="absolute top-0 right-0 w-32 h-32 bg-[#A8E6CF]/30 rounded-bl-[100px]"></div>
                     
                     <span class="text-xs text-[#4B5EAA] font-black uppercase tracking-[0.2em] absolute top-10 font-display">Term</span>
                     <h3 class="text-6xl font-serif font-medium text-[#4B5EAA] mb-8">{{ currentCard.word }}</h3>
                     <p class="text-[#4B5EAA] font-mono text-xl bg-[#E0F2FE] px-8 py-3 rounded-full border border-[#A7C7E7]">{{ currentCard.ipa }}</p>
                     <button (click)="play($event, currentCard.word)" class="mt-12 text-[#4B5EAA] bg-[#FFDAC1] hover:bg-[#FFE5D9] transition-colors p-5 rounded-full border border-[#FFDAC1]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                     </button>
                  </div>

                  <!-- BACK (White) -->
                  <div class="card-back absolute w-full h-full backface-hidden bg-white rounded-[40px] rotate-y-180 flex flex-col items-center justify-center p-10 border border-[#E0F2FE]">
                     <span class="text-xs text-[#A7C7E7] font-black uppercase tracking-[0.2em] absolute top-10 font-display">Definition</span>
                     <p class="text-3xl text-[#4B5EAA] leading-relaxed max-w-lg font-serif">{{ currentCard.definition }}</p>
                     @if (currentCard.example) {
                       <div class="mt-10 text-base text-[#64748B] italic bg-[#F0F9FF] px-8 py-6 rounded-3xl border border-[#E0F2FE] max-w-md font-serif">
                          "{{ currentCard.example }}"
                       </div>
                     }
                  </div>
                </div>
              </div>

              <!-- SRS Controls -->
              <div class="mt-12 grid grid-cols-4 gap-4 w-full max-w-xl px-4">
                 @if (!isFlipped) {
                    <div class="col-span-4 text-center text-[#A7C7E7] text-sm animate-pulse font-bold font-display uppercase tracking-widest">Tap card to flip</div>
                 } @else {
                    <button (click)="rateCard(0)" class="flex flex-col items-center py-4 bg-[#FFE4E1] hover:bg-[#FFDAC1] text-[#4B5EAA] rounded-3xl transition-colors shadow-sm">
                       <span class="font-bold text-sm font-display">Again</span>
                       <span class="text-[10px] opacity-80 font-bold">1m</span>
                    </button>
                    <button (click)="rateCard(1)" class="flex flex-col items-center py-4 bg-[#FFF5BA] hover:bg-[#FFFCF2] text-[#4B5EAA] rounded-3xl transition-colors shadow-sm">
                       <span class="font-bold text-sm font-display">Hard</span>
                       <span class="text-[10px] opacity-80 font-bold">1d</span>
                    </button>
                    <button (click)="rateCard(2)" class="flex flex-col items-center py-4 bg-[#E0F2FE] hover:bg-[#A7C7E7] text-[#4B5EAA] rounded-3xl transition-colors shadow-sm">
                       <span class="font-bold text-sm font-display">Good</span>
                       <span class="text-[10px] opacity-80 font-bold">3d</span>
                    </button>
                    <button (click)="rateCard(3)" class="flex flex-col items-center py-4 bg-[#A8E6CF] hover:bg-[#B5EAD7] text-[#4B5EAA] rounded-3xl transition-colors shadow-sm">
                       <span class="font-bold text-sm font-display">Easy</span>
                       <span class="text-[10px] opacity-80 font-bold">7d</span>
                    </button>
                 }
              </div>

            } @else {
              <!-- Empty State -->
              <div class="text-center py-16">
                 <div class="h-32 w-32 bg-[#A8E6CF] text-[#4B5EAA] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-[#B5EAD7]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h3 class="text-3xl font-bold text-[#4B5EAA] mb-3 font-display">All caught up!</h3>
                 <p class="text-[#64748B] mb-8 font-serif italic text-lg">No cards due for review.</p>
                 <button (click)="viewMode.set('create')" class="px-10 py-4 bg-[#A7C7E7] text-white rounded-full font-bold hover:bg-[#4B5EAA] shadow-lg transition-all font-display">Add more words</button>
              </div>
            }
          </div>
        }

        <!-- VIEW: LIST -->
        @if (viewMode() === 'list') {
          <div class="max-w-4xl mx-auto">
             <div class="bg-white rounded-[36px] shadow-sm border border-[#E0F2FE] overflow-hidden">
                <div class="p-6 border-b border-[#E0F2FE] bg-[#F0F9FF] flex justify-between">
                   <h3 class="font-bold text-[#4B5EAA] font-display text-lg">Collection ({{ vocabService.cards().length }})</h3>
                </div>
                <div class="divide-y divide-[#E0F2FE]">
                   @for (card of vocabService.cards(); track card.id) {
                      <div class="p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors group">
                         <div class="flex-1">
                            <div class="flex items-center gap-4">
                               <span class="font-bold text-[#4B5EAA] text-xl font-serif">{{ card.word }}</span>
                               @if(card.ipa) { <span class="text-xs font-mono text-[#4B5EAA] bg-[#B5EAD7] px-3 py-1 rounded-full border border-[#A8E6CF]">{{ card.ipa }}</span> }
                               <button (click)="play($event, card.word)" class="text-[#A7C7E7] hover:text-[#4B5EAA] p-2 hover:bg-[#E0F2FE] rounded-full transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                               </button>
                            </div>
                            <p class="text-[#64748B] mt-2 text-base font-serif italic">{{ card.definition }}</p>
                         </div>
                         <div class="flex flex-col items-end gap-3">
                             <span class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-display" 
                                [ngClass]="{
                                    'bg-[#A8E6CF] text-[#4B5EAA] border border-[#B5EAD7]': card.repetition > 3,
                                    'bg-[#E0F2FE] text-[#4B5EAA] border border-[#A7C7E7]': card.repetition > 1 && card.repetition <= 3,
                                    'bg-[#F9FAFB] text-[#64748B] border border-[#E0F2FE]': card.repetition <= 1
                                }">
                                {{ card.repetition > 3 ? 'Mastered' : (card.repetition > 1 ? 'Learning' : 'New') }}
                             </span>
                             <button (click)="deleteCard(card.id)" class="text-[#E11D48] p-2.5 hover:bg-[#FFE4E1] rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                             </button>
                         </div>
                      </div>
                   }
                </div>
             </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .perspective { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
  `]
})
export class VocabularyComponent {
  viewMode = signal<'list' | 'study' | 'create'>('study');
  
  creationRows: Partial<Flashcard>[] = [{ word: '', definition: '' }, { word: '', definition: '' }, { word: '', definition: '' }];
  isProcessing = signal(false);

  studyQueue = signal<Flashcard[]>([]);
  currentCardIndex = 0;
  isFlipped = false;

  vocabService = inject(VocabularyService);
  geminiService = inject(GeminiService);
  audioService = inject(AudioService);

  constructor() {
    this.refreshStudyQueue();
  }

  deleteCard(id: string) {
    if(confirm('Delete this card?')) {
        this.vocabService.deleteCard(id);
        this.refreshStudyQueue();
    }
  }

  addRow() {
    this.creationRows.push({ word: '', definition: '' });
  }

  removeRow(index: number) {
    if (this.creationRows.length > 1) {
      this.creationRows.splice(index, 1);
    }
  }

  async magicFill() {
    this.isProcessing.set(true);
    const targets = this.creationRows.filter(r => r.word && (!r.definition || !r.ipa));
    
    for (const row of targets) {
        if (!row.word) continue;
        try {
            const details = await this.geminiService.getWordDetails(row.word);
            row.definition = row.definition || details.definition;
            row.ipa = details.ipa;
            row.example = details.example;
        } catch(e) { console.error(e); }
    }
    this.isProcessing.set(false);
  }

  saveSet() {
    const validCards = this.creationRows.filter(r => r.word && r.definition);
    if (validCards.length === 0) return;
    
    this.vocabService.addCards(validCards);
    this.creationRows = [{ word: '', definition: '' }, { word: '', definition: '' }, { word: '', definition: '' }];
    this.refreshStudyQueue();
    this.viewMode.set('list');
  }

  refreshStudyQueue() {
    this.studyQueue.set(this.vocabService.getDueCards());
    this.currentCardIndex = 0;
    this.isFlipped = false;
  }

  get currentCard() {
    return this.studyQueue()[this.currentCardIndex];
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
  }

  rateCard(rating: 0 | 1 | 2 | 3) {
    if (!this.currentCard) return;
    this.vocabService.processReview(this.currentCard.id, rating);
    if (this.currentCardIndex < this.studyQueue().length - 1) {
        this.currentCardIndex++;
        this.isFlipped = false;
    } else {
        this.refreshStudyQueue();
    }
  }

  play(event: Event, text: string) {
    event.stopPropagation(); 
    this.audioService.playText(text);
  }
}