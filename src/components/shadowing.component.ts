import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GeminiService } from '../services/gemini.service';
import { AudioService } from '../services/audio.service';
import { UserProgressService } from '../services/user-progress.service';

interface Sentence {
  text: string;
  ipa: string;
}

@Component({
  selector: 'app-shadowing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:p-10 max-w-5xl mx-auto h-full flex flex-col bg-[#F9FAFB]">
      <h2 class="text-3xl font-bold text-[#4B5EAA] mb-8 flex items-center gap-4 font-display">
        <div class="p-3 bg-[#A7C7E7] text-[#4B5EAA] rounded-2xl border border-[#E0F2FE]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </div>
        Shadowing Practice
      </h2>

      <!-- Mode Switch (Ice Blue / Sky Blue) -->
      <div class="flex rounded-full bg-[#E0F2FE] p-1.5 self-center mb-8 overflow-hidden h-16 w-full max-w-md relative border border-[#A7C7E7]">
        <button
          (click)="mode.set('standard')"
          class="flex-1 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 font-display"
          [class.bg-[#4B5EAA]]="mode() === 'standard'"
          [class.text-white]="mode() === 'standard'"
          [class.shadow-md]="mode() === 'standard'"
          [class.text-[#64748B]]="mode() !== 'standard'"
        >
          Sentence Mode
        </button>
        <button
          (click)="mode.set('youtube')"
          class="flex-1 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 gap-2 z-10 font-display"
          [class.bg-[#4B5EAA]]="mode() === 'youtube'"
          [class.text-white]="mode() === 'youtube'"
          [class.shadow-md]="mode() === 'youtube'"
          [class.text-[#64748B]]="mode() !== 'youtube'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          YouTube
        </button>
      </div>

      <div class="bg-[#FFFCF2] rounded-[36px] p-8 flex-1 flex flex-col items-center relative overflow-hidden overflow-y-auto border border-[#FFDAC1] shadow-sm">
        
        @if (mode() === 'standard') {
            <!-- Text Card -->
            <div class="w-full max-w-3xl text-center space-y-8 mt-6">
              <p class="text-sm font-black text-[#A7C7E7] uppercase tracking-[0.2em] font-display">Read Aloud</p>
              <blockquote class="text-4xl md:text-5xl font-medium text-[#4B5EAA] leading-tight tracking-tight font-serif">
                "{{ currentSentence().text }}"
              </blockquote>

              <!-- IPA Display (Butter Yellow) -->
              <div class="inline-block">
                 <p class="text-xl text-[#4B5EAA] font-mono px-8 py-4 bg-[#FFF5BA] rounded-full border border-[#D9E8D8]">
                    {{ currentSentence().ipa }}
                 </p>
              </div>
              
              <div class="flex justify-center gap-4 flex-wrap mt-10">
                <button (click)="listen()" class="h-14 px-8 rounded-full bg-[#E0F2FE] text-[#4B5EAA] hover:bg-[#A7C7E7] transition-colors text-sm font-bold flex items-center gap-2 border border-[#A7C7E7]">
                   <span class="material-icons-round text-xl">volume_up</span>
                   Listen
                </button>
                
                <button (click)="listenSlow()" class="h-14 px-8 rounded-full bg-[#E0F2FE] text-[#4B5EAA] hover:bg-[#A7C7E7] transition-colors text-sm font-bold flex items-center gap-2 border border-[#A7C7E7]">
                   <span class="material-icons-round text-xl">speed</span>
                   Slow (0.5x)
                </button>

                <button (click)="nextSentence()" class="h-14 px-10 rounded-full bg-[#D4C4FB] text-[#4B5EAA] hover:bg-[#F3E8FF] transition-all shadow-md text-sm font-bold flex items-center gap-2">
                   Next
                   <span class="material-icons-round text-xl">arrow_forward</span>
                </button>
              </div>
            </div>
        } @else {
            <!-- YouTube Mode -->
            <div class="w-full max-w-3xl space-y-6 flex flex-col items-center">
                <div class="w-full relative">
                    <input type="text" [(ngModel)]="ytUrl" placeholder=" " 
                           class="peer w-full h-16 px-6 rounded-2xl border-none bg-[#FFF5BA]/50 focus:ring-2 focus:ring-[#A7C7E7] outline-none placeholder-transparent pt-4 text-[#4B5EAA] font-serif">
                    <label class="absolute left-6 top-5 text-[#64748B] text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#64748B] pointer-events-none font-bold">YouTube Link</label>
                </div>
                
                @if (safeVideoUrl()) {
                    <div class="w-full aspect-video bg-black rounded-[24px] overflow-hidden shadow-lg border-4 border-[#FFF5BA]">
                        <iframe [src]="safeVideoUrl()" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                } @else {
                    <div class="w-full aspect-video bg-[#FFF5BA]/30 rounded-[24px] flex items-center justify-center text-[#4B5EAA] border-2 border-dashed border-[#FFDAC1] font-display font-bold">
                        Video Preview
                    </div>
                }

                <div class="w-full relative">
                    <textarea 
                        [(ngModel)]="ytScript"
                        placeholder=" "
                        class="peer w-full h-40 px-6 py-4 rounded-2xl border-none bg-[#FFF5BA]/50 focus:ring-2 focus:ring-[#A7C7E7] outline-none resize-none text-[#4B5EAA] placeholder-transparent font-serif"
                    ></textarea>
                    <label class="absolute left-6 top-5 text-[#64748B] text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#64748B] pointer-events-none font-bold">Transcript / Script</label>
                </div>
            </div>
        }

        <!-- FAB Recording Button (Light Coral from Set 3) -->
        <div class="relative z-10 mt-auto pt-10 pb-4">
          @if (!isRecording()) {
             <button (click)="startRecording()" 
                [disabled]="mode() === 'youtube' && !ytScript"
                [class.opacity-50]="mode() === 'youtube' && !ytScript"
                class="h-28 w-28 bg-[#FFE4E1] hover:bg-[#FFDAC1] rounded-[40px] flex items-center justify-center text-[#4B5EAA] shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group ring-8 ring-[#FFFCF2]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             </button>
          } @else {
             <button (click)="stopRecording()" class="h-28 w-28 bg-[#4B5EAA] hover:bg-[#64748B] rounded-[40px] flex items-center justify-center text-white shadow-xl ring-8 ring-[#E0F2FE] animate-pulse">
                <div class="h-10 w-10 bg-[#FFE4E1] rounded-xl"></div>
             </button>
          }
          <p class="mt-4 text-center text-[#64748B] font-bold text-sm h-4 tracking-wide font-display uppercase">
            @if (mode() === 'youtube' && !ytScript) {
                Enter script to record
            } @else {
                {{ isRecording() ? 'Listening...' : 'Tap to Record' }}
            }
          </p>
        </div>

        <!-- Feedback Section -->
        @if (analyzing()) {
           <div class="absolute inset-0 bg-[#F9FAFB]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-[36px]">
              <div class="w-20 h-20 border-8 border-[#E0F2FE] border-t-[#A8E6CF] rounded-full animate-spin mb-6"></div>
              <p class="text-[#4B5EAA] font-bold text-lg font-display">Analyzing audio...</p>
           </div>
        }

        @if (feedback()) {
           <div class="w-full bg-[#F0F9FF] border border-[#A7C7E7] rounded-[32px] p-8 mt-4 animate-fade-in-up shadow-sm">
              <div class="flex items-center justify-between mb-6">
                 <h3 class="font-bold text-2xl text-[#4B5EAA] font-display">Analysis Results</h3>
                 <div class="px-6 py-2 bg-[#A8E6CF] text-[#4B5EAA] rounded-full font-black text-lg border border-[#B5EAD7]">Score: {{ feedback().score }}/100</div>
              </div>
              
              <p class="text-[#64748B] italic mb-8 font-serif text-lg leading-relaxed">"{{ feedback().general_feedback }}"</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <!-- Phonemes (Mint Breeze - Mint Green) -->
                 <div class="bg-[#A8E6CF]/30 p-6 rounded-[28px] border border-[#A8E6CF]">
                    <h4 class="font-black text-xs text-[#4B5EAA] mb-4 uppercase tracking-wider font-display">Phonemes</h4>
                    <ul class="space-y-4">
                       @for (err of feedback().phoneme_feedback; track $index) {
                          <li class="text-base bg-white p-4 rounded-[20px] shadow-sm text-[#4B5EAA] border border-[#E0F2FE]">
                             <span class="text-[#E11D48] font-bold font-serif">{{ err.word }}</span> 
                             <div class="flex items-center gap-2 mt-2">
                                <span class="bg-[#E0F2FE] px-3 py-1 rounded-lg text-sm font-mono border border-[#A7C7E7] text-[#4B5EAA]">Exp: {{ err.expected_phoneme }}</span>
                                <span class="text-[#64748B]">→</span>
                                <span class="bg-[#FFE4E1] text-[#881337] px-3 py-1 rounded-lg text-sm font-mono border border-[#FFDAC1]">Hrd: {{ err.actual_phoneme || '?' }}</span>
                             </div>
                             <div class="text-sm text-[#64748B] mt-2 italic">{{ err.tip }}</div>
                          </li>
                       }
                       @if (feedback().phoneme_feedback?.length === 0) {
                          <li class="text-base text-[#4B5EAA] flex items-center gap-3 font-bold bg-[#B5EAD7] p-4 rounded-[20px] border border-[#A8E6CF]">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                             Perfect articulation!
                          </li>
                       }
                    </ul>
                 </div>
                 <!-- Intonation (Lavender Dream) -->
                 <div class="bg-[#D4C4FB]/30 p-6 rounded-[28px] border border-[#D4C4FB]">
                    <h4 class="font-black text-xs text-[#4B5EAA] mb-4 uppercase tracking-wider font-display">Intonation</h4>
                    <p class="text-base text-[#4B5EAA] leading-relaxed font-serif">{{ feedback().intonation_comment }}</p>
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
export class ShadowingComponent {
  mode = signal<'standard' | 'youtube'>('standard');
  
  // Standard Mode Data
  sentences: Sentence[] = [
    { 
      text: "The quick brown fox jumps over the lazy dog.", 
      ipa: "/ðə kwɪk braʊn fɒks dʒʌmps ˈəʊvə ðə ˈleɪzi dɒg/" 
    },
    { 
      text: "She sells seashells by the seashore.", 
      ipa: "/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔː/" 
    },
    { 
      text: "I haven't the faintest idea what you mean.", 
      ipa: "/aɪ ˈhævnt ðə ˈfeɪntɪst aɪˈdɪə wɒt juː miːn/" 
    },
    { 
      text: "Could you please elaborate on that specific point?", 
      ipa: "/kʊd juː pliːz ɪˈlæbəreɪt ɒn ðæt spəˈsɪfɪk pɔɪnt/" 
    }
  ];
  currentSentence = signal<Sentence>(this.sentences[0]);

  // YouTube Mode Data
  ytUrl = '';
  ytScript = '';
  
  isRecording = signal(false);
  analyzing = signal(false);
  feedback = signal<any>(null);

  geminiService = inject(GeminiService);
  audioService = inject(AudioService);
  progressService = inject(UserProgressService); 
  sanitizer = inject(DomSanitizer);

  // Computed safe URL for iframe
  safeVideoUrl = computed(() => {
    if (!this.ytUrl) return null;
    let videoId = '';
    try {
        if (this.ytUrl.includes('v=')) {
            videoId = this.ytUrl.split('v=')[1].split('&')[0];
        } else if (this.ytUrl.includes('youtu.be/')) {
            videoId = this.ytUrl.split('youtu.be/')[1].split('?')[0];
        }
    } catch(e) {}
    
    if (videoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    }
    return null;
  });

  listen() {
    this.audioService.playText(this.currentSentence().text, 1.0);
  }

  listenSlow() {
    this.audioService.playText(this.currentSentence().text, 0.5);
  }

  nextSentence() {
    const idx = this.sentences.indexOf(this.currentSentence());
    this.currentSentence.set(this.sentences[(idx + 1) % this.sentences.length]);
    this.feedback.set(null);
  }

  async startRecording() {
    this.feedback.set(null);
    await this.audioService.startRecording();
    this.isRecording.set(true);
  }

  async stopRecording() {
    this.isRecording.set(false);
    this.analyzing.set(true);
    
    const referenceText = this.mode() === 'standard' 
        ? this.currentSentence().text 
        : this.ytScript;

    try {
      const b64 = await this.audioService.stopRecording();
      const result = await this.geminiService.analyzePronunciation(b64, referenceText);
      this.feedback.set(result);

      if (result.score) {
        this.progressService.updateSkill('Pronunciation', result.score);
        this.progressService.updateSkill('Intonation', result.score > 80 ? result.score - 5 : result.score); 
        this.progressService.updateSkill('Fluency', result.score + 5 > 100 ? 100 : result.score + 5);
      }

    } catch (e) {
      console.error(e);
      alert('Error analyzing audio. Please try again.');
    } finally {
      this.analyzing.set(false);
    }
  }
}