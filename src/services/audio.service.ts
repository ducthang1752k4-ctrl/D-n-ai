import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  
  isRecording = signal(false);

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject('No recording in progress');
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        
        // Stop all tracks
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        this.isRecording.set(false);
      };

      this.mediaRecorder.stop();
    });
  }

  playText(text: string, rate: number = 0.9) {
    this.speak(text, undefined, rate);
  }

  speak(text: string, onEnd?: () => void, rate: number = 1.0) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      
      // Select a better voice if available
      const voices = window.speechSynthesis.getVoices();
      // Try to find a Google US English voice or similar high quality one
      const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
      if (preferredVoice) utterance.voice = preferredVoice;

      if (onEnd) {
        utterance.onend = onEnd;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("TTS not supported");
      if (onEnd) onEnd();
    }
  }

  cancelSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}