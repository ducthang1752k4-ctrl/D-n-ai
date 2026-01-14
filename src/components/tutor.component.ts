import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chat } from '@google/genai';
import { GeminiService } from '../services/gemini.service';
import { AudioService } from '../services/audio.service';

type LiveState = 'idle' | 'recording' | 'processing' | 'speaking';

interface TranscriptItem {
  sender: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-tutor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full bg-[#111827] rounded-none md:rounded-b-[32px] overflow-hidden relative">
      <!-- Ambient Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#111827] to-[#312E81] opacity-50"></div>
      
      <!-- Content Wrapper -->
      <div class="relative z-10 flex flex-col h-full p-6">
        
        <!-- Header -->
        <header class="flex justify-between items-center mb-4">
           <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                 <span class="material-icons text-white">graphic_eq</span>
              </div>
              <h2 class="text-white font-display text-lg tracking-wide">Gemini Live Tutor</h2>
           </div>
           <div class="px-3 py-1 rounded-full border border-white/20 text-white/60 text-xs font-mono uppercase">
              {{ state() === 'idle' ? 'Ready' : state() }}
           </div>
        </header>

        <!-- Main Visualizer Area -->
        <div class="flex-1 flex flex-col items-center justify-center relative">
           
           <!-- The Orb -->
           <div class="relative w-64 h-64 flex items-center justify-center transition-all duration-500"
                [ngClass]="{
                  'scale-110': state() !== 'idle'
                }">
              
              <!-- Idle / Base -->
              <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 opacity-20 blur-3xl animate-pulse"></div>
              
              <!-- Recording Ring -->
              <div *ngIf="state() === 'recording'" class="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping"></div>
              
              <!-- Processing Ring -->
              <div *ngIf="state() === 'processing'" class="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin"></div>

              <!-- Main Circle -->
              <div class="w-40 h-40 rounded-full bg-gradient-to-br shadow-2xl flex items-center justify-center transition-colors duration-500 relative overflow-hidden"
                   [ngClass]="{
                      'from-slate-700 to-slate-900': state() === 'idle',
                      'from-red-500 to-pink-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]': state() === 'recording',
                      'from-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] animate-pulse': state() === 'processing',
                      'from-emerald-400 to-green-500 shadow-[0_0_30px_rgba(52,211,153,0.6)]': state() === 'speaking'
                   }">
                 
                 <!-- Icon inside Orb -->
                 <span class="material-icons text-5xl text-white/90 drop-shadow-md transition-all duration-300 transform"
                    [ngClass]="{
                       'scale-125': state() !== 'idle'
                    }">
                    {{ state() === 'speaking' ? 'volume_up' : (state() === 'recording' ? 'mic' : (state() === 'processing' ? 'auto_awesome' : 'mic_none')) }}
                 </span>
                 
                 <!-- Voice Waves (fake) for speaking -->
                 <div *ngIf="state() === 'speaking'" class="absolute inset-0 flex items-center justify-center space-x-1">
                    <div class="w-1 h-8 bg-white/40 rounded-full animate-wave"></div>
                    <div class="w-1 h-12 bg-white/60 rounded-full animate-wave delay-75"></div>
                    <div class="w-1 h-6 bg-white/40 rounded-full animate-wave delay-150"></div>
                 </div>
              </div>
           </div>

           <!-- Current Text Display (Subtitles) -->
           <div class="mt-8 h-24 w-full max-w-lg text-center px-4 flex items-center justify-center">
              <p class="text-xl md:text-2xl font-serif leading-relaxed transition-all duration-300"
                 [ngClass]="{
                    'text-white/90': state() === 'speaking',
                    'text-white/50 italic': state() === 'recording',
                    'text-cyan-400 animate-pulse': state() === 'processing',
                    'text-white/40': state() === 'idle'
                 }">
                 {{ displayMessage() }}
              </p>
           </div>
        </div>

        <!-- Controls -->
        <div class="mt-auto flex justify-center pb-8 pt-4">
           @if (state() === 'recording') {
             <button (click)="stopRecording()" class="h-20 w-20 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 hover:scale-105 transition-all flex items-center justify-center">
                <span class="material-icons text-4xl">stop</span>
             </button>
           } @else if (state() === 'speaking') {
             <button (click)="interrupt()" class="h-20 w-20 rounded-full bg-slate-700 text-white/80 border border-white/10 hover:bg-slate-600 transition-all flex items-center justify-center">
                <span class="material-icons text-4xl">close</span>
             </button>
           } @else {
             <button (click)="startRecording()" [disabled]="state() === 'processing'" class="h-20 w-20 rounded-full bg-white text-[#111827] shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 transition-all flex items-center justify-center disabled:opacity-50 disabled:scale-100">
                <span class="material-icons text-4xl">mic</span>
             </button>
           }
        </div>
        
        <!-- Transcript Drawer (Optional/Hidden by default for immersive feel, minimal here) -->
        <div class="absolute bottom-4 left-6">
           <button (click)="showTranscript = !showTranscript" class="text-white/30 hover:text-white/80 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
              <span class="material-icons text-sm">history</span> {{ showTranscript ? 'Hide' : 'Show' }} Transcript
           </button>
        </div>
        
        <div *ngIf="showTranscript" class="absolute bottom-16 left-6 right-6 bg-black/80 backdrop-blur-xl rounded-2xl p-4 max-h-60 overflow-y-auto border border-white/10 transition-all">
           <div class="space-y-3">
              @for (item of transcript(); track $index) {
                 <div [class.text-right]="item.sender === 'user'">
                    <span class="inline-block px-3 py-2 rounded-xl text-sm max-w-[80%]"
                       [ngClass]="{
                          'bg-blue-600/30 text-blue-100 border border-blue-500/30': item.sender === 'user',
                          'bg-slate-700/50 text-slate-200 border border-slate-600/30': item.sender === 'model'
                       }">
                       {{ item.text }}
                    </span>
                 </div>
              }
           </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes wave {
      0%, 100% { height: 10px; opacity: 0.5; }
      50% { height: 100%; opacity: 1; }
    }
    .animate-wave {
      animation: wave 1s ease-in-out infinite;
    }
  `]
})
export class TutorComponent implements OnDestroy {
  state = signal<LiveState>('idle');
  displayMessage = signal<string>("Tap the microphone to start talking.");
  transcript = signal<TranscriptItem[]>([]);
  showTranscript = false;

  private chatSession: Chat | null = null;
  private audioService = inject(AudioService);
  private geminiService = inject(GeminiService);

  constructor() {
    this.startNewSession();
  }

  startNewSession() {
    this.chatSession = this.geminiService.createVoiceChat();
    this.transcript.set([]);
    this.displayMessage.set("Hello! I'm Lingua. Tap the mic to practice English.");
  }

  async startRecording() {
    if (this.state() === 'processing') return;
    this.audioService.cancelSpeech(); // Stop any current TTS
    try {
      await this.audioService.startRecording();
      this.state.set('recording');
      this.displayMessage.set("Listening...");
    } catch (e) {
      console.error(e);
      this.displayMessage.set("Microphone access denied.");
    }
  }

  async stopRecording() {
    if (this.state() !== 'recording') return;
    
    this.state.set('processing');
    this.displayMessage.set("Thinking...");

    try {
      const audioBase64 = await this.audioService.stopRecording();
      
      // Optimistic update
      // We don't have the user's text yet (audio-only), so we just show a placeholder in transcript if needed,
      // or we just wait for the model's reply.
      // Ideally we would transcribe it first, but to keep it fast ("Live"), we send audio directly.

      if (!this.chatSession) this.startNewSession();

      // Send audio to Gemini Chat
      const response = await this.chatSession!.sendMessage({
        role: 'user',
        parts: [{ inlineData: { mimeType: 'audio/wav', data: audioBase64 } }]
      });

      const replyText = response.text;
      
      // Update Transcript
      this.transcript.update(t => [
         ...t, 
         { sender: 'user', text: '(Audio Message)' }, 
         { sender: 'model', text: replyText }
      ]);

      // Speak
      this.displayMessage.set(replyText);
      this.state.set('speaking');
      
      // Use AudioService to speak. We need a callback for when it ends to set state back to idle.
      // Since AudioService uses window.speechSynthesis, strictly it's synchronous to queue, but async to play.
      // We can approximate or use the `onend` event if we expose it.
      // For now, let's update AudioService to return a promise or accept a callback.
      // Or just fire and forget, and let user interrupt.
      
      this.audioService.speak(replyText, () => {
         // On End
         this.state.set('idle');
         this.displayMessage.set("Tap to reply...");
      });

    } catch (e) {
      console.error(e);
      this.state.set('idle');
      this.displayMessage.set("Sorry, I didn't catch that.");
    }
  }

  interrupt() {
    this.audioService.cancelSpeech();
    this.state.set('idle');
    this.displayMessage.set("Stopped.");
  }

  ngOnDestroy() {
    this.audioService.cancelSpeech();
  }
}