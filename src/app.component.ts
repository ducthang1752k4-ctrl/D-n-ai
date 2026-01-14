import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard.component';
import { ShadowingComponent } from './components/shadowing.component';
import { TutorComponent } from './components/tutor.component';
import { VocabularyComponent } from './components/vocabulary.component';
import { ReadingComponent } from './components/reading.component';
import { GrammarComponent } from './components/grammar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    ShadowingComponent, 
    TutorComponent,
    VocabularyComponent,
    ReadingComponent,
    GrammarComponent
  ],
  template: `
    <div class="flex h-screen selection:bg-[#D4C4FB] selection:text-[#4B5EAA]">
      <!-- Sidebar: Mint Breeze + Lavender Dream -->
      <aside class="w-20 md:w-72 bg-[#F9FAFB]/80 backdrop-blur-xl flex-shrink-0 flex flex-col justify-between p-4 transition-all duration-300 border-r border-[#E0F2FE]">
        <div>
          <div class="h-16 flex items-center px-4 mb-6">
             <!-- Logo: Mint Green -->
             <div class="h-12 w-12 bg-[#A8E6CF] rounded-2xl flex items-center justify-center text-[#4B5EAA] font-bold text-2xl mr-0 md:mr-3 shadow-sm transform rotate-6 border-2 border-[#D4C4FB]">L</div>
             <span class="font-bold text-[#4B5EAA] hidden md:block text-2xl tracking-tight font-display">LinguaAI</span>
          </div>

          <nav class="space-y-3">
            <button 
              (click)="view.set('dashboard')" 
              [class.bg-[#D4C4FB]]="view() === 'dashboard'"
              [class.text-[#4B5EAA]]="view() === 'dashboard'"
              [class.shadow-sm]="view() === 'dashboard'"
              [class.text-[#64748B]]="view() !== 'dashboard'"
              class="w-full flex items-center h-14 px-5 rounded-full transition-all duration-300 hover:bg-[#E0F2FE] active:scale-95 group border border-transparent"
            >
              <span class="material-icons-outlined text-2xl md:mr-4" [class.text-[#4B5EAA]]="view() === 'dashboard'" [class.text-[#A7C7E7]]="view() !== 'dashboard'">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </span>
              <span class="text-sm font-semibold tracking-wide hidden md:block">Dashboard</span>
            </button>

            <button 
              (click)="view.set('shadowing')" 
              [class.bg-[#A8E6CF]]="view() === 'shadowing'"
              [class.text-[#4B5EAA]]="view() === 'shadowing'"
              [class.shadow-sm]="view() === 'shadowing'"
              [class.text-[#64748B]]="view() !== 'shadowing'"
               class="w-full flex items-center h-14 px-5 rounded-full transition-all duration-300 hover:bg-[#D9E8D8] active:scale-95 group border border-transparent"
            >
              <span class="material-icons-outlined text-2xl md:mr-4" [class.text-[#4B5EAA]]="view() === 'shadowing'" [class.text-[#A7C7E7]]="view() !== 'shadowing'">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </span>
              <span class="text-sm font-semibold tracking-wide hidden md:block">Practice</span>
            </button>
            
            <button 
              (click)="view.set('reading')" 
              [class.bg-[#E0F9FF]]="view() === 'reading'"
              [class.text-[#4B5EAA]]="view() === 'reading'"
              [class.shadow-sm]="view() === 'reading'"
              [class.text-[#64748B]]="view() !== 'reading'"
               class="w-full flex items-center h-14 px-5 rounded-full transition-all duration-300 hover:bg-[#D9E8D8] active:scale-95 group border border-transparent"
            >
              <span class="material-icons-outlined text-2xl md:mr-4" [class.text-[#4B5EAA]]="view() === 'reading'" [class.text-[#A7C7E7]]="view() !== 'reading'">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </span>
              <span class="text-sm font-semibold tracking-wide hidden md:block">Reading</span>
            </button>

            <button 
              (click)="view.set('grammar')" 
               [class.bg-[#FFDAC1]]="view() === 'grammar'"
              [class.text-[#4B5EAA]]="view() === 'grammar'"
              [class.shadow-sm]="view() === 'grammar'"
              [class.text-[#64748B]]="view() !== 'grammar'"
               class="w-full flex items-center h-14 px-5 rounded-full transition-all duration-300 hover:bg-[#FFE5D9] active:scale-95 group border border-transparent"
            >
              <span class="material-icons-outlined text-2xl md:mr-4" [class.text-[#4B5EAA]]="view() === 'grammar'" [class.text-[#A7C7E7]]="view() !== 'grammar'">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              </span>
              <span class="text-sm font-semibold tracking-wide hidden md:block">Grammar</span>
            </button>

            <button 
              (click)="view.set('tutor')" 
               [class.bg-[#F3E8FF]]="view() === 'tutor'"
              [class.text-[#4B5EAA]]="view() === 'tutor'"
              [class.shadow-sm]="view() === 'tutor'"
              [class.text-[#64748B]]="view() !== 'tutor'"
               class="w-full flex items-center h-14 px-5 rounded-full transition-all duration-300 hover:bg-[#D4C4FB]/50 active:scale-95 group border border-transparent"
            >
              <span class="material-icons-outlined text-2xl md:mr-4" [class.text-[#4B5EAA]]="view() === 'tutor'" [class.text-[#A7C7E7]]="view() !== 'tutor'">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </span>
              <span class="text-sm font-semibold tracking-wide hidden md:block">AI Tutor</span>
            </button>

            <button 
              (click)="view.set('vocabulary')" 
               [class.bg-[#FFF5BA]]="view() === 'vocabulary'"
              [class.text-[#4B5EAA]]="view() === 'vocabulary'"
              [class.shadow-sm]="view() === 'vocabulary'"
              [class.text-[#64748B]]="view() !== 'vocabulary'"
               class="w-full flex items-center h-14 px-5 rounded-full transition-all duration-300 hover:bg-[#FFFCF2] active:scale-95 group border border-transparent"
            >
               <span class="material-icons-outlined text-2xl md:mr-4" [class.text-[#4B5EAA]]="view() === 'vocabulary'" [class.text-[#A7C7E7]]="view() !== 'vocabulary'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               </span>
              <span class="text-sm font-semibold tracking-wide hidden md:block">Vocabulary</span>
            </button>
          </nav>
        </div>

        <div class="px-2">
           <div class="flex items-center gap-4 p-4 rounded-[20px] bg-[#FFFFFF]/60 hover:bg-[#FFFFFF]/80 cursor-pointer transition-colors border border-[#E0F2FE]">
              <div class="h-10 w-10 rounded-full bg-[#A7C7E7] overflow-hidden border-2 border-[#E0F2FE] shadow-sm">
                <img src="https://picsum.photos/100/100" class="h-full w-full object-cover">
              </div>
              <div class="hidden md:block">
                 <p class="text-sm font-bold text-[#4B5EAA] font-display">Student</p>
                 <p class="text-xs text-[#64748B] font-bold">Level 3</p>
              </div>
           </div>
        </div>
      </aside>

      <!-- Main Content (Soft White / Off-white from Set 1) -->
      <main class="flex-1 my-3 mr-3 bg-[#F9FAFB] rounded-[32px] overflow-hidden shadow-[0_4px_30px_rgb(0,0,0,0.02)] border border-[#E0F2FE]/50 relative">
        <div class="relative h-full">
            @switch (view()) {
              @case ('dashboard') {
                <app-dashboard />
              }
              @case ('shadowing') {
                <app-shadowing />
              }
              @case ('tutor') {
                <app-tutor />
              }
              @case ('vocabulary') {
                <app-vocabulary />
              }
              @case ('reading') {
                <app-reading />
              }
              @case ('grammar') {
                <app-grammar />
              }
            }
        </div>
      </main>
    </div>
  `
})
export class AppComponent {
  view = signal<'dashboard' | 'shadowing' | 'tutor' | 'vocabulary' | 'reading' | 'grammar'>('dashboard');
}