import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

interface ReadingQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelected?: number;
}

interface ReadingData {
  passage?: string | null;
  questions: ReadingQuestion[];
}

interface ReadingTopic {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'TOEIC';
  title: string;
  icon: string;
}

@Component({
  selector: 'app-reading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#F9FAFB] rounded-b-[32px] overflow-hidden">
      <!-- Top Navigation (Sky Blue Theme) -->
      <header class="bg-[#F0F9FF] px-6 py-5 flex justify-between items-center shrink-0 border-b border-[#A7C7E7]">
        <h2 class="text-2xl font-bold text-[#4B5EAA] flex items-center gap-3 font-display">
          <div class="p-2 bg-[#A7C7E7] text-white rounded-xl shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          Reading Library
        </h2>
        
        <div class="flex items-center gap-2">
           @if (viewMode() !== 'library') {
             <button (click)="reset()" class="text-sm font-bold text-[#64748B] hover:text-[#4B5EAA] px-4 py-2 hover:bg-[#A7C7E7]/20 rounded-full transition-colors font-display">
               Back to Library
             </button>
           }
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F9FAFB]">
        
        <!-- MODE: LIBRARY -->
        @if (viewMode() === 'library') {
          <div class="max-w-6xl mx-auto space-y-8">
             
             <!-- Custom Generator Card -->
             <div class="bg-[#FFFCF2] p-8 rounded-[36px] border border-[#FFDAC1] shadow-sm relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-40 h-40 bg-[#FFF5BA]/50 rounded-bl-full -mr-10 -mt-10"></div>
                 <h3 class="text-xl font-bold text-[#4B5EAA] mb-4 font-display flex items-center gap-2">
                    <span class="material-icons-outlined">edit_note</span> Create Custom Reading
                 </h3>
                 <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <input type="text" [(ngModel)]="customTopic" placeholder="Enter any topic (e.g. Space Travel, Coffee, AI...)" 
                           class="w-full h-14 px-6 rounded-2xl border-none bg-white focus:ring-2 focus:ring-[#FFDAC1] outline-none text-[#4B5EAA] shadow-sm font-serif">
                    </div>
                    <select [(ngModel)]="customLevel" class="h-14 px-6 rounded-2xl border-none bg-white text-[#4B5EAA] font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#FFDAC1]">
                        <option value="A1">Level A1 (Beginner)</option>
                        <option value="A2">Level A2 (Elementary)</option>
                        <option value="B1">Level B1 (Intermediate)</option>
                        <option value="B2">Level B2 (Upper Int.)</option>
                        <option value="C1">Level C1 (Advanced)</option>
                    </select>
                    <button (click)="startCustomTest()" [disabled]="!customTopic || loading()" 
                       class="h-14 px-8 bg-[#FFDAC1] hover:bg-[#FFE5D9] text-[#4B5EAA] font-bold rounded-2xl transition-colors shadow-sm disabled:opacity-50 font-display">
                       Generate
                    </button>
                 </div>
             </div>

             <!-- Filter Tabs -->
             <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button (click)="selectedFilter.set('ALL')" [class.bg-[#4B5EAA]]="selectedFilter() === 'ALL'" [class.text-white]="selectedFilter() === 'ALL'" class="px-6 py-2 rounded-full bg-white text-[#64748B] font-bold text-sm border border-[#E0F2FE] hover:bg-[#F0F9FF] transition-colors whitespace-nowrap">All Levels</button>
                <button (click)="selectedFilter.set('A1')" [class.bg-[#A8E6CF]]="selectedFilter() === 'A1'" [class.text-[#065F46]]="selectedFilter() === 'A1'" class="px-6 py-2 rounded-full bg-white text-[#64748B] font-bold text-sm border border-[#E0F2FE] hover:bg-[#F0F9FF] transition-colors whitespace-nowrap">A1 Beginner</button>
                <button (click)="selectedFilter.set('A2')" [class.bg-[#A8E6CF]]="selectedFilter() === 'A2'" [class.text-[#065F46]]="selectedFilter() === 'A2'" class="px-6 py-2 rounded-full bg-white text-[#64748B] font-bold text-sm border border-[#E0F2FE] hover:bg-[#F0F9FF] transition-colors whitespace-nowrap">A2 Elementary</button>
                <button (click)="selectedFilter.set('B1')" [class.bg-[#E0F2FE]]="selectedFilter() === 'B1'" [class.text-[#1E40AF]]="selectedFilter() === 'B1'" class="px-6 py-2 rounded-full bg-white text-[#64748B] font-bold text-sm border border-[#E0F2FE] hover:bg-[#F0F9FF] transition-colors whitespace-nowrap">B1 Intermediate</button>
                <button (click)="selectedFilter.set('B2')" [class.bg-[#E0F2FE]]="selectedFilter() === 'B2'" [class.text-[#1E40AF]]="selectedFilter() === 'B2'" class="px-6 py-2 rounded-full bg-white text-[#64748B] font-bold text-sm border border-[#E0F2FE] hover:bg-[#F0F9FF] transition-colors whitespace-nowrap">B2 Upper Int.</button>
                <button (click)="selectedFilter.set('C1')" [class.bg-[#D4C4FB]]="selectedFilter() === 'C1'" [class.text-[#5B21B6]]="selectedFilter() === 'C1'" class="px-6 py-2 rounded-full bg-white text-[#64748B] font-bold text-sm border border-[#E0F2FE] hover:bg-[#F0F9FF] transition-colors whitespace-nowrap">C1 Advanced</button>
                <button (click)="selectedFilter.set('TOEIC')" [class.bg-[#FFF5BA]]="selectedFilter() === 'TOEIC'" [class.text-[#92400E]]="selectedFilter() === 'TOEIC'" class="px-6 py-2 rounded-full bg-white text-[#64748B] font-bold text-sm border border-[#E0F2FE] hover:bg-[#F0F9FF] transition-colors whitespace-nowrap">TOEIC Practice</button>
             </div>

             @if(loading()) {
                <div class="flex flex-col items-center justify-center py-20">
                   <div class="animate-spin rounded-full h-16 w-16 border-4 border-[#A7C7E7] border-t-[#4B5EAA]"></div>
                   <p class="mt-6 text-[#4B5EAA] font-bold font-display animate-pulse">Generating your lesson...</p>
                </div>
             } @else {
                <!-- Library Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   @for (item of filteredTopics(); track item.title) {
                      <div (click)="startTopicTest(item)" 
                         class="group bg-white p-6 rounded-[28px] border border-[#E0F2FE] hover:border-[#A7C7E7] shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col">
                         
                         <!-- Level Tag -->
                         <div class="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                            [ngClass]="{
                               'bg-[#A8E6CF] text-[#065F46] border-[#6EE7B7]': item.level.startsWith('A'),
                               'bg-[#E0F2FE] text-[#1E40AF] border-[#93C5FD]': item.level.startsWith('B'),
                               'bg-[#D4C4FB] text-[#5B21B6] border-[#C4B5FD]': item.level.startsWith('C'),
                               'bg-[#FFF5BA] text-[#92400E] border-[#FDE68A]': item.level === 'TOEIC'
                            }">
                            {{ item.level }}
                         </div>

                         <div class="w-12 h-12 rounded-2xl bg-[#F9FAFB] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                            {{ item.icon }}
                         </div>
                         
                         <h4 class="text-lg font-bold text-[#4B5EAA] font-display mb-2 group-hover:text-[#2563EB] transition-colors">{{ item.title }}</h4>
                         <p class="text-sm text-[#64748B] font-serif mb-4 flex-1">Practice reading comprehension with this {{ item.level === 'TOEIC' ? 'test format' : 'topic' }}.</p>
                         
                         <div class="flex items-center text-[#A7C7E7] font-bold text-sm group-hover:translate-x-1 transition-transform">
                            Start Reading <span class="material-icons-outlined text-base ml-1">arrow_forward</span>
                         </div>
                      </div>
                   }
                </div>
             }
          </div>
        }

        <!-- MODE: QUIZ (Same as before) -->
        @if (viewMode() === 'quiz' && readingData()) {
          <div class="max-w-5xl mx-auto h-full flex flex-col md:flex-row gap-6">
             <!-- Passage -->
             <div class="w-full md:w-1/2 bg-white rounded-[32px] p-8 border border-[#E0F2FE] shadow-sm overflow-y-auto h-fit md:max-h-full">
                <span class="text-xs font-black text-[#A7C7E7] uppercase tracking-widest mb-4 block font-display">Passage</span>
                <div class="prose prose-slate text-[#4B5EAA] font-serif leading-relaxed whitespace-pre-wrap text-lg">
                  {{ readingData()?.passage || 'Complete the sentences below.' }}
                </div>
             </div>

             <!-- Questions -->
             <div class="flex-1 space-y-6 overflow-y-auto">
                @for (q of readingData()?.questions; track q.id; let i = $index) {
                   <div class="bg-white p-6 rounded-[28px] border border-[#D9E8D8] shadow-sm">
                      <div class="flex items-start gap-4 mb-4">
                         <span class="flex-shrink-0 h-8 w-8 rounded-full bg-[#FFF5BA] text-[#4B5EAA] flex items-center justify-center font-bold border border-[#D9E8D8]">{{ i + 1 }}</span>
                         <p class="text-lg font-serif text-[#4B5EAA] font-medium pt-1">{{ q.questionText }}</p>
                      </div>

                      <div class="space-y-3 pl-12">
                         @for (opt of q.options; track opt; let optIdx = $index) {
                            <label class="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl hover:bg-[#F0F9FF] transition-colors border border-transparent hover:border-[#E0F2FE]">
                               <input type="radio" [name]="'q' + q.id" [value]="optIdx" 
                                      (change)="selectAnswer(q.id, optIdx)"
                                      [checked]="q.userSelected === optIdx"
                                      class="w-5 h-5 text-[#4B5EAA] focus:ring-[#A7C7E7] border-gray-300">
                               <span class="text-[#64748B] group-hover:text-[#4B5EAA] font-serif">{{ opt }}</span>
                            </label>
                         }
                      </div>
                   </div>
                }

                <div class="flex justify-end pt-4 pb-12">
                   <button (click)="submitTest()" 
                      [disabled]="!allAnswered()"
                      [class.opacity-50]="!allAnswered()"
                      class="px-8 py-4 bg-[#4B5EAA] text-white font-bold rounded-full shadow-lg hover:bg-[#3B4D9A] transition-all font-display flex items-center gap-2">
                      Submit Answers
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                   </button>
                </div>
             </div>
          </div>
        }

        <!-- MODE: RESULTS (Same as before) -->
        @if (viewMode() === 'result' && readingData()) {
           <div class="max-w-4xl mx-auto">
              <!-- Score Card -->
              <div class="bg-[#E0F9FF] p-8 rounded-[36px] border border-[#A7C7E7] text-center mb-8 relative overflow-hidden">
                 <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFF5BA] to-[#A7C7E7]"></div>
                 <h3 class="text-xl text-[#4B5EAA] font-display font-bold mb-2">Test Complete</h3>
                 <div class="text-6xl font-black text-[#4B5EAA] mb-2">{{ calculateScore() }}%</div>
                 <p class="text-[#64748B] font-bold uppercase tracking-widest text-xs">Accuracy</p>
                 <button (click)="reset()" class="mt-6 px-6 py-2 bg-white text-[#4B5EAA] rounded-full text-sm font-bold shadow-sm hover:bg-[#F0F9FF]">Try Another Test</button>
              </div>

              <div class="space-y-6 pb-12">
                 @for (q of readingData()?.questions; track q.id; let i = $index) {
                    <div class="bg-white p-6 rounded-[28px] border shadow-sm"
                         [ngClass]="q.userSelected === q.correctIndex ? 'border-[#D9E8D8]' : 'border-[#FFDAC1]'">
                       
                       <div class="flex items-start gap-4 mb-4">
                          <span class="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-white"
                             [ngClass]="q.userSelected === q.correctIndex ? 'bg-[#A8E6CF]' : 'bg-[#FFE4E1] text-[#E11D48]'">
                             @if(q.userSelected === q.correctIndex) { ✓ } @else { ✕ }
                          </span>
                          <div>
                             <p class="text-lg font-serif text-[#4B5EAA] font-medium">{{ q.questionText }}</p>
                             
                             <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                @for (opt of q.options; track opt; let optIdx = $index) {
                                   <div class="p-3 rounded-xl border text-sm font-serif flex justify-between items-center"
                                      [ngClass]="{
                                         'bg-[#D9E8D8]/50 border-[#A8E6CF] text-[#4B5EAA] font-bold': optIdx === q.correctIndex,
                                         'bg-[#FFE4E1]/50 border-[#FFDAC1] text-[#E11D48]': optIdx === q.userSelected && optIdx !== q.correctIndex,
                                         'bg-gray-50 border-gray-100 text-[#64748B]': optIdx !== q.correctIndex && optIdx !== q.userSelected
                                      }">
                                      <span>{{ opt }}</span>
                                      @if(optIdx === q.correctIndex) { <span class="text-xs font-black uppercase">Correct</span> }
                                      @if(optIdx === q.userSelected && optIdx !== q.correctIndex) { <span class="text-xs font-black uppercase">Your Ans</span> }
                                   </div>
                                }
                             </div>

                             <div class="mt-4 p-4 bg-[#F0F9FF] rounded-2xl border border-[#E0F2FE] text-sm text-[#4B5EAA]">
                                <span class="font-bold font-display mr-2">Explanation:</span> {{ q.explanation }}
                             </div>
                          </div>
                       </div>
                    </div>
                 }
              </div>
           </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ReadingComponent {
  viewMode = signal<'library' | 'quiz' | 'result'>('library');
  loading = signal(false);
  readingData = signal<ReadingData | null>(null);
  selectedFilter = signal<string>('ALL');

  // Custom Generator Inputs
  customTopic = '';
  customLevel = 'B1';

  geminiService = inject(GeminiService);

  // 30+ Curated Topics for the Library
  readingTopics: ReadingTopic[] = [
    // A1
    { level: 'A1', title: 'My Daily Routine', icon: '⏰' },
    { level: 'A1', title: 'My Family', icon: '👨‍👩‍👧' },
    { level: 'A1', title: 'At the Supermarket', icon: '🛒' },
    { level: 'A1', title: 'My Favorite Color', icon: '🎨' },
    { level: 'A1', title: 'A Day at the Park', icon: '🌳' },
    // A2
    { level: 'A2', title: 'Planning a Holiday', icon: '✈️' },
    { level: 'A2', title: 'My Best Friend', icon: '🤝' },
    { level: 'A2', title: 'Visiting a Doctor', icon: '🩺' },
    { level: 'A2', title: 'A Birthday Party', icon: '🎂' },
    { level: 'A2', title: 'Using Public Transport', icon: '🚌' },
    // B1
    { level: 'B1', title: 'History of Coffee', icon: '☕' },
    { level: 'B1', title: 'Social Media Habits', icon: '📱' },
    { level: 'B1', title: 'Healthy Eating', icon: '🥗' },
    { level: 'B1', title: 'Famous Landmarks', icon: '🗽' },
    { level: 'B1', title: 'Movies vs Books', icon: '🎬' },
    // B2
    { level: 'B2', title: 'Climate Change', icon: '🌍' },
    { level: 'B2', title: 'Remote Work Culture', icon: '💻' },
    { level: 'B2', title: 'The Impact of Tourism', icon: '📸' },
    { level: 'B2', title: 'Space Exploration', icon: '🚀' },
    { level: 'B2', title: 'Digital Privacy', icon: '🔒' },
    // C1
    { level: 'C1', title: 'Artificial Intelligence Ethics', icon: '🤖' },
    { level: 'C1', title: 'Global Economics', icon: '📈' },
    { level: 'C1', title: 'Philosophy of Happiness', icon: '🤔' },
    { level: 'C1', title: 'Quantum Computing Basics', icon: '⚛️' },
    { level: 'C1', title: 'Modern Architecture', icon: 'buildings' },
    // TOEIC
    { level: 'TOEIC', title: 'Part 5: Incomplete Sentences', icon: '📝' },
    { level: 'TOEIC', title: 'Part 7: Reading Comprehension', icon: '📑' },
    { level: 'TOEIC', title: 'Business Email Etiquette', icon: '📧' },
    { level: 'TOEIC', title: 'Office Memos', icon: '📌' },
    { level: 'TOEIC', title: 'Advertisement Analysis', icon: '📢' },
  ];

  filteredTopics = computed(() => {
    if (this.selectedFilter() === 'ALL') return this.readingTopics;
    return this.readingTopics.filter(t => t.level === this.selectedFilter());
  });

  async startTopicTest(topic: ReadingTopic) {
    this.loading.set(true);
    try {
      if (topic.level === 'TOEIC' && (topic.title.includes('Part 5') || topic.title.includes('Part 7'))) {
         // Use the specialized TOEIC generator
         const part = topic.title.includes('Part 5') ? 'Part 5' : 'Part 7';
         const data = await this.geminiService.generateReadingPractice(part);
         this.readingData.set(data);
      } else {
         // Use the general topic generator
         const data = await this.geminiService.generateReadingByTopic(topic.title, topic.level);
         this.readingData.set(data);
      }
      this.viewMode.set('quiz');
    } catch (e) {
      console.error(e);
      alert('Could not generate test. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async startCustomTest() {
     if(!this.customTopic) return;
     this.loading.set(true);
     try {
        const data = await this.geminiService.generateReadingByTopic(this.customTopic, this.customLevel);
        this.readingData.set(data);
        this.viewMode.set('quiz');
        this.customTopic = ''; // reset
     } catch (e) {
        console.error(e);
        alert('Could not generate custom test.');
     } finally {
        this.loading.set(false);
     }
  }

  selectAnswer(questionId: number, optionIndex: number) {
    this.readingData.update(data => {
      if (!data) return null;
      const questions = data.questions.map(q => {
        if (q.id === questionId) {
          return { ...q, userSelected: optionIndex };
        }
        return q;
      });
      return { ...data, questions };
    });
  }

  allAnswered(): boolean {
    return this.readingData()?.questions.every(q => q.userSelected !== undefined) ?? false;
  }

  submitTest() {
    this.viewMode.set('result');
  }

  calculateScore(): number {
    const data = this.readingData();
    if (!data) return 0;
    const correct = data.questions.filter(q => q.userSelected === q.correctIndex).length;
    return Math.round((correct / data.questions.length) * 100);
  }

  reset() {
    this.readingData.set(null);
    this.viewMode.set('library');
  }
}