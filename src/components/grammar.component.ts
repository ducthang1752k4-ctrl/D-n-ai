import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

interface GrammarStructure {
  formula: string;
  example: string;
}

interface GrammarLesson {
  title: string;
  purpose: string;
  structures: {
    affirmative: GrammarStructure;
    negative: GrammarStructure;
    interrogative: GrammarStructure;
  };
  situations: string[];
}

@Component({
  selector: 'app-grammar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#FFFCF2] rounded-b-[32px] overflow-hidden">
      <!-- Header (Peach Mint Serenity) -->
      <header class="bg-[#FFDAC1]/40 px-6 py-5 flex justify-between items-center shrink-0 border-b border-[#FFDAC1]">
        <h2 class="text-2xl font-bold text-[#4B5EAA] flex items-center gap-3 font-display">
          <div class="p-2 bg-[#FFDAC1] text-[#4B5EAA] rounded-xl shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          Grammar Master
        </h2>
      </header>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-6 md:p-10">
        
        <!-- Search Section -->
        <div class="max-w-3xl mx-auto mb-10">
           <form (submit)="searchGrammar($event)" class="relative">
              <input type="text" [(ngModel)]="searchQuery" name="topic" 
                 placeholder="Enter a topic (e.g., Present Perfect, Conditionals...)"
                 class="w-full h-16 pl-8 pr-32 rounded-full bg-white border-2 border-[#FFDAC1] focus:border-[#B5EAD7] focus:ring-4 focus:ring-[#B5EAD7]/30 outline-none text-[#4B5EAA] text-lg font-serif placeholder-[#4B5EAA]/50 shadow-sm transition-all"
                 [disabled]="loading()">
              
              <button type="submit" [disabled]="!searchQuery || loading()"
                 class="absolute right-2 top-2 h-12 px-8 bg-[#4B5EAA] text-white rounded-full font-bold hover:bg-[#3B4D9A] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-display">
                 @if(loading()) { <span class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> }
                 @else { Learn }
              </button>
           </form>
           
           <!-- Suggestions -->
           @if (!lesson() && !loading()) {
             <div class="mt-6 flex flex-wrap gap-3 justify-center">
                <button (click)="quickSearch('Present Simple')" class="px-4 py-2 bg-[#E0F7FA] text-[#4B5EAA] rounded-xl hover:bg-[#B5EAD7] transition-colors text-sm font-bold">Present Simple</button>
                <button (click)="quickSearch('Past Continuous')" class="px-4 py-2 bg-[#F3E8FF] text-[#4B5EAA] rounded-xl hover:bg-[#D4C4FB] transition-colors text-sm font-bold">Past Continuous</button>
                <button (click)="quickSearch('First Conditional')" class="px-4 py-2 bg-[#FFDAC1]/50 text-[#4B5EAA] rounded-xl hover:bg-[#FFDAC1] transition-colors text-sm font-bold">First Conditional</button>
                <button (click)="quickSearch('Passive Voice')" class="px-4 py-2 bg-[#E0F2FE] text-[#4B5EAA] rounded-xl hover:bg-[#A7C7E7] transition-colors text-sm font-bold">Passive Voice</button>
             </div>
           }
        </div>

        @if (lesson()) {
          <div class="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            
            <!-- 1. Communicative Purpose (Hero Card) -->
            <div class="bg-[#F3E8FF] p-8 rounded-[36px] border border-[#D4C4FB] relative overflow-hidden">
               <div class="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <h3 class="text-sm font-black text-[#4B5EAA] uppercase tracking-widest mb-3 font-display">Communicative Purpose</h3>
               <h1 class="text-3xl md:text-4xl font-serif text-[#4B5EAA] leading-snug">
                 {{ lesson()?.purpose }}
               </h1>
            </div>

            <!-- 2. Structures (3 Columns) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
               
               <!-- Affirmative (+) -->
               <div class="bg-[#B5EAD7] p-6 rounded-[28px] border border-[#A8E6CF] flex flex-col h-full hover:scale-[1.02] transition-transform">
                  <div class="flex items-center gap-3 mb-4">
                     <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#4B5EAA] font-black text-xl shadow-sm">+</div>
                     <span class="font-bold text-[#4B5EAA] font-display">Affirmative</span>
                  </div>
                  <div class="bg-white/60 p-4 rounded-2xl mb-4 border border-white/50">
                     <p class="font-mono text-sm text-[#4B5EAA] font-bold">{{ lesson()?.structures?.affirmative?.formula }}</p>
                  </div>
                  <p class="mt-auto text-[#4B5EAA] font-serif italic text-lg leading-relaxed">
                    "{{ lesson()?.structures?.affirmative?.example }}"
                  </p>
               </div>

               <!-- Negative (-) -->
               <div class="bg-[#FFDAC1] p-6 rounded-[28px] border border-[#FFCCAA] flex flex-col h-full hover:scale-[1.02] transition-transform">
                  <div class="flex items-center gap-3 mb-4">
                     <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#E11D48] font-black text-xl shadow-sm">-</div>
                     <span class="font-bold text-[#E11D48] font-display">Negative</span>
                  </div>
                   <div class="bg-white/60 p-4 rounded-2xl mb-4 border border-white/50">
                     <p class="font-mono text-sm text-[#E11D48] font-bold">{{ lesson()?.structures?.negative?.formula }}</p>
                  </div>
                  <p class="mt-auto text-[#E11D48] font-serif italic text-lg leading-relaxed">
                    "{{ lesson()?.structures?.negative?.example }}"
                  </p>
               </div>

               <!-- Interrogative (?) -->
               <div class="bg-[#E0F7FA] p-6 rounded-[28px] border border-[#B2EBF2] flex flex-col h-full hover:scale-[1.02] transition-transform">
                  <div class="flex items-center gap-3 mb-4">
                     <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0F7490] font-black text-xl shadow-sm">?</div>
                     <span class="font-bold text-[#0F7490] font-display">Interrogative</span>
                  </div>
                   <div class="bg-white/60 p-4 rounded-2xl mb-4 border border-white/50">
                     <p class="font-mono text-sm text-[#0F7490] font-bold">{{ lesson()?.structures?.interrogative?.formula }}</p>
                  </div>
                  <p class="mt-auto text-[#0F7490] font-serif italic text-lg leading-relaxed">
                    "{{ lesson()?.structures?.interrogative?.example }}"
                  </p>
               </div>
            </div>

            <!-- 3. Situations (List) -->
            <div class="bg-white p-8 rounded-[36px] border border-[#E0F2FE] shadow-sm">
               <h3 class="text-xl font-bold text-[#4B5EAA] mb-6 flex items-center gap-2 font-display">
                  <span class="material-icons-outlined text-[#B5EAD7]">lightbulb</span>
                  When to use it
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (sit of lesson()?.situations; track $index) {
                     <div class="flex items-start gap-3 p-4 rounded-2xl bg-[#FFFCF2] border border-[#FFDAC1]">
                        <div class="w-2 h-2 rounded-full bg-[#4B5EAA] mt-2 shrink-0"></div>
                        <p class="text-[#4B5EAA] font-serif">{{ sit }}</p>
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
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.2, 0.0, 0, 1.0) forwards;
    }
  `]
})
export class GrammarComponent {
  searchQuery = '';
  loading = signal(false);
  lesson = signal<GrammarLesson | null>(null);

  geminiService = inject(GeminiService);

  async searchGrammar(e: Event) {
    e.preventDefault();
    if (!this.searchQuery.trim()) return;
    this.fetchData(this.searchQuery);
  }

  quickSearch(topic: string) {
    this.searchQuery = topic;
    this.fetchData(topic);
  }

  async fetchData(topic: string) {
    this.loading.set(true);
    this.lesson.set(null);
    try {
      const data = await this.geminiService.generateGrammarLesson(topic);
      this.lesson.set(data);
    } catch (e) {
      console.error(e);
      alert('Could not fetch grammar lesson.');
    } finally {
      this.loading.set(false);
    }
  }
}