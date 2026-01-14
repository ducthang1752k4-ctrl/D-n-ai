import { Injectable, signal, effect } from '@angular/core';

export interface SkillData {
  axis: string;
  value: number;
}

export interface HistoryPoint {
  date: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserProgressService {
  // Initial baseline scores
  private readonly INITIAL_STATS: SkillData[] = [
    { axis: "Pronunciation", value: 60 },
    { axis: "Intonation", value: 50 },
    { axis: "Fluency", value: 55 },
    { axis: "Vocabulary", value: 65 },
    { axis: "Listening", value: 70 }
  ];

  // Signals
  stats = signal<SkillData[]>(this.INITIAL_STATS);
  history = signal<HistoryPoint[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Updates a specific skill using an Exponential Moving Average (EMA).
   * This ensures the chart evolves smoothly rather than jumping wildly.
   * @param skillName The name of the axis (e.g., 'Pronunciation')
   * @param newScore The raw score from the AI (0-100)
   */
  updateSkill(skillName: string, newScore: number) {
    const ALPHA = 0.3; // Weight for new data. Higher = faster adaptation.

    this.stats.update(currentStats => {
      return currentStats.map(stat => {
        if (stat.axis.toLowerCase() === skillName.toLowerCase()) {
          // EMA Formula: Old + Alpha * (New - Old)
          const smoothValue = stat.value + ALPHA * (newScore - stat.value);
          return { ...stat, value: Math.round(smoothValue) };
        }
        return stat;
      });
    });

    this.addHistoryPoint(newScore);
    this.saveToStorage();
  }

  private addHistoryPoint(score: number) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    this.history.update(h => {
      const newHistory = [...h, { date: today, score }];
      // Keep last 7 entries for the sparkline
      return newHistory.slice(-7); 
    });
  }

  private saveToStorage() {
    localStorage.setItem('lingua_stats', JSON.stringify(this.stats()));
    localStorage.setItem('lingua_history', JSON.stringify(this.history()));
  }

  private loadFromStorage() {
    const storedStats = localStorage.getItem('lingua_stats');
    const storedHistory = localStorage.getItem('lingua_history');

    if (storedStats) {
      this.stats.set(JSON.parse(storedStats));
    }
    
    if (storedHistory) {
      this.history.set(JSON.parse(storedHistory));
    } else {
      // Mock history for visual appeal on first load
      this.history.set([
        { date: 'Mon', score: 65 },
        { date: 'Tue', score: 68 },
        { date: 'Wed', score: 62 },
        { date: 'Thu', score: 70 },
        { date: 'Fri', score: 75 }
      ]);
    }
  }

  getOverallLevel(): string {
    const avg = this.stats().reduce((acc, curr) => acc + curr.value, 0) / this.stats().length;
    if (avg > 85) return 'Advanced';
    if (avg > 70) return 'Upper Intermediate';
    if (avg > 50) return 'Intermediate';
    return 'Beginner';
  }
}