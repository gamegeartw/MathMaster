import { Component, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MathService, MathProblem } from './services/math.service';
import { AiTutorService } from './services/ai-tutor.service';
import { VoiceService } from './services/voice.service';
import { LeaderboardService, ScoreEntry } from './services/leaderboard.service';

type AppMode = 'menu' | 'div-select' | 'game' | 'summary' | 'leaderboard';
type MathMode = 'add' | 'sub' | 'div' | 'mixed';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {
  mathService = inject(MathService);
  aiService = inject(AiTutorService);
  voiceService = inject(VoiceService);
  leaderboardService = inject(LeaderboardService);

  // --- State Signals ---
  appMode = signal<AppMode>('menu');
  selectedMathMode = signal<MathMode>('add'); // Stores which math type we are doing
  specificDivisor = signal<number | null>(null); // For division mode specific selection
  
  // Game State
  currentProblem = signal<MathProblem | null>(null);
  userAnswer = signal<string>('');
  score = signal<number>(0);
  questionCount = signal<number>(0); // Current question number
  
  // Configuration
  totalQuestions = signal<number>(10);
  customQuestionCount = signal<number | null>(null);
  
  // Feedback
  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'error' | 'neutral'>('neutral');
  aiHint = signal<string>('');
  isLoadingAi = signal<boolean>(false);

  // Timer
  timerSeconds = signal<number>(0);
  timerInterval: any;
  isTimeWarning = computed(() => this.timerSeconds() > 30);

  // Leaderboard
  playerName = signal<string>('');
  leaderboardData = signal<ScoreEntry[]>([]);

  // --- Computed ---
  modeTitle = computed(() => {
    switch (this.selectedMathMode()) {
      case 'add': return '加法練習';
      case 'sub': return '減法練習';
      case 'div': 
        return this.specificDivisor() 
          ? `估商練習 (${this.specificDivisor()})` 
          : '估商練習';
      case 'mixed': return '綜合挑戰';
      default: return '數學大師';
    }
  });

  constructor() {}

  // --- Game Flow ---

  // Step 1: Menu selection
  selectMode(mode: MathMode) {
    if (mode === 'div') {
      this.appMode.set('div-select');
    } else {
      this.selectedMathMode.set(mode);
      this.specificDivisor.set(null); // Clear previous selection
      this.initializeGame();
    }
  }

  // Step 1.5: Division specific selection
  selectDivisor(num: number) {
    this.selectedMathMode.set('div');
    this.specificDivisor.set(num);
    this.initializeGame();
  }

  // Step 2: Initialize Game Configuration
  initializeGame() {
    // Determine total questions
    let count = 10;
    const custom = this.customQuestionCount();
    const mode = this.selectedMathMode();
    
    if (custom && custom > 0) {
      count = custom;
    } else {
      switch (mode) {
        case 'add': count = 50; break;
        case 'sub': count = 50; break;
        case 'div': count = 15; break;
        case 'mixed': count = 20; break;
      }
    }
    
    this.totalQuestions.set(count);
    this.appMode.set('game');
    this.score.set(0);
    this.questionCount.set(0);
    this.nextQuestion();
  }

  returnToMenu() {
    this.stopTimer();
    this.appMode.set('menu');
    this.currentProblem.set(null);
    this.userAnswer.set('');
    this.feedbackMessage.set('');
    this.aiHint.set('');
    this.specificDivisor.set(null);
  }

  nextQuestion() {
    // Check if game over
    if (this.questionCount() >= this.totalQuestions()) {
      this.finishGame();
      return;
    }

    this.stopTimer();
    this.questionCount.update(c => c + 1);
    
    // Reset UI for new question
    this.userAnswer.set('');
    this.feedbackMessage.set('');
    this.feedbackType.set('neutral');
    this.aiHint.set('');
    
    // Generate Problem
    let problem: MathProblem;
    switch (this.selectedMathMode()) {
      case 'add': problem = this.mathService.generateAddition(); break;
      case 'sub': problem = this.mathService.generateSubtraction(); break;
      case 'div': 
        // Pass the specific divisor if set
        problem = this.mathService.generateDivision(this.specificDivisor() || undefined); 
        break;
      case 'mixed': problem = this.mathService.generateMixed(); break;
      default: problem = this.mathService.generateAddition();
    }
    this.currentProblem.set(problem);

    // Start Timer
    this.timerSeconds.set(0);
    this.timerInterval = setInterval(() => {
      this.timerSeconds.update(s => s + 1);
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  finishGame() {
    this.stopTimer();
    this.appMode.set('summary');
  }

  // --- Interaction ---

  appendNumber(num: number) {
    if (this.feedbackType() === 'success') return;
    const current = this.userAnswer();
    if (current.length < 5) {
      this.userAnswer.set(current + num.toString());
    }
  }

  backspace() {
    if (this.feedbackType() === 'success') return;
    const current = this.userAnswer();
    this.userAnswer.set(current.slice(0, -1));
  }

  toggleVoiceInput() {
    this.voiceService.startListening((transcript) => {
      // Basic Chinese Number Parsing
      const parsed = this.parseChineseNumber(transcript);
      if (parsed !== null) {
         this.userAnswer.set(parsed.toString());
      } else {
        // Fallback: try to just keep digits
        const digits = transcript.replace(/\D/g, '');
        if (digits) {
          this.userAnswer.set(digits);
        }
      }
    });
  }

  // Simple Chinese Text to Number helper (supports simple spoken numbers like "二十五", "38")
  parseChineseNumber(text: string): number | null {
    // If it's already digits
    if (!isNaN(Number(text))) return Number(text);

    // Try extracting digits first
    const match = text.match(/\d+/);
    if (match) return parseInt(match[0], 10);

    // Simple mapping for single digits
    const map: Record<string, number> = {
      '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '零': 0
    };
    
    // Loop through map to see if the text contains any of these
    // This is a very basic fuzzy check for single digits said in Chinese
    for (const key in map) {
      if (text.includes(key)) {
        return map[key];
      }
    }

    return null; // Fail
  }

  checkAnswer() {
    const problem = this.currentProblem();
    if (!problem || !this.userAnswer()) return;
    
    this.stopTimer();

    const val = parseInt(this.userAnswer(), 10);
    
    if (val === problem.answer) {
      this.feedbackType.set('success');
      this.feedbackMessage.set('答對了！太棒了！ 🎉');
      this.score.update(s => s + 10);
      setTimeout(() => {
        this.nextQuestion();
      }, 1500);
    } else {
      this.feedbackType.set('error');
      this.feedbackMessage.set('再試一次喔！加油！');
      this.score.update(s => Math.max(0, s - 5));
      this.userAnswer.set('');
       this.timerInterval = setInterval(() => {
        this.timerSeconds.update(s => s + 1);
      }, 1000);
    }
  }

  async askForHelp() {
    const problem = this.currentProblem();
    if (!problem) return;

    this.isLoadingAi.set(true);
    this.aiHint.set('');
    
    const hint = await this.aiService.getExplanation(problem.hintPrompt);
    
    this.aiHint.set(hint);
    this.isLoadingAi.set(false);
  }

  // --- Leaderboard Logic ---

  async submitScore() {
    if (!this.playerName().trim()) return;

    const entry: ScoreEntry = {
      name: this.playerName().trim(),
      score: this.score(),
      mode: this.modeTitle(),
      date: new Date()
    };

    await this.leaderboardService.addScore(entry);
    this.showLeaderboard();
  }

  async showLeaderboard() {
    this.appMode.set('leaderboard');
    const data = await this.leaderboardService.getTopScores();
    this.leaderboardData.set(data);
  }
}