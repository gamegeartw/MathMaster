import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MathService, MathProblem } from './services/math.service';
import { AiTutorService } from './services/ai-tutor.service';
import { LeaderboardService, ScoreEntry } from './services/leaderboard.service';
import { I18nService } from './services/i18n.service';

import { MenuComponent } from './components/menu/menu.component';
import { DivisorSelectComponent } from './components/divisor-select/divisor-select.component';
import { GameComponent } from './components/game/game.component';
import { SummaryComponent } from './components/summary/summary.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { AppMode, MathMode } from './app.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MenuComponent,
    DivisorSelectComponent,
    GameComponent,
    SummaryComponent,
    LeaderboardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {
  mathService = inject(MathService);
  aiService = inject(AiTutorService);
  leaderboardService = inject(LeaderboardService);
  i18n = inject(I18nService);

  // Expose enums to template
  AppMode = AppMode;

  // --- State Signals ---
  appMode = signal<AppMode>(AppMode.Menu);
  selectedMathMode = signal<MathMode>(MathMode.Add);
  specificDivisor = signal<number | null>(null);
  
  // Game State
  currentProblem = signal<MathProblem | null>(null);
  userAnswer = signal<string>('');
  score = signal<number>(0);
  questionCount = signal<number>(0);
  
  // Configuration
  totalQuestions = signal<number>(10);
  customQuestionCount = signal<number | null>(null);
  
  // Feedback
  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'error' | 'neutral'>('neutral');
  aiHint = signal<string>('');
  isLoadingAi = signal<boolean>(false);

  // Timers
  timerSeconds = signal<number>(0);
  timerInterval: any;
  sessionStartTime = signal<number>(0);
  sessionTotalTimeSeconds = signal<number>(0);
  isTimeWarning = computed(() => this.timerSeconds() > 30);

  // Leaderboard
  playerName = signal<string>('');
  leaderboardData = signal<ScoreEntry[]>([]);

  // --- Computed ---
  modeTitle = computed(() => {
    switch (this.selectedMathMode()) {
      case MathMode.Add: return this.i18n.t('addPractice');
      case MathMode.Sub: return this.i18n.t('subPractice');
      case MathMode.Div: 
        const divisor = this.specificDivisor();
        return divisor
          ? this.i18n.t('divPracticeWithNum', { divisor })
          : this.i18n.t('divPractice');
      case MathMode.Mixed: return this.i18n.t('mixedChallenge');
      default: return this.i18n.t('appTitle');
    }
  });

  // --- Game Flow & Event Handlers ---

  handleCustomQuestionCountChange(value: number | null) {
    if (value !== null && value < 0) {
      this.customQuestionCount.set(null);
    } else {
      this.customQuestionCount.set(value);
    }
  }

  selectMode(mode: MathMode) {
    if (mode === MathMode.Div) {
      this.appMode.set(AppMode.DivSelect);
    } else {
      this.selectedMathMode.set(mode);
      this.specificDivisor.set(null);
      this.initializeGame();
    }
  }

  selectDivisor(num: number) {
    this.selectedMathMode.set(MathMode.Div);
    this.specificDivisor.set(num);
    this.initializeGame();
  }

  initializeGame() {
    let count = 10;
    const custom = this.customQuestionCount();
    const mode = this.selectedMathMode();
    
    if (custom && custom > 0) {
      count = custom;
    } else {
      switch (mode) {
        case MathMode.Add: count = 50; break;
        case MathMode.Sub: count = 50; break;
        case MathMode.Div: count = 15; break;
        case MathMode.Mixed: count = 20; break;
      }
    }
    
    this.totalQuestions.set(count);
    this.appMode.set(AppMode.Game);
    this.score.set(0);
    this.questionCount.set(0);
    this.sessionStartTime.set(Date.now());
    this.nextQuestion();
  }

  returnToMenu() {
    this.stopTimer();
    this.appMode.set(AppMode.Menu);
    this.currentProblem.set(null);
    this.userAnswer.set('');
    this.feedbackMessage.set('');
    this.aiHint.set('');
    this.specificDivisor.set(null);
  }

  nextQuestion() {
    if (this.questionCount() >= this.totalQuestions()) {
      this.finishGame();
      return;
    }

    this.stopTimer();
    this.questionCount.update(c => c + 1);
    
    this.userAnswer.set('');
    this.feedbackMessage.set('');
    this.feedbackType.set('neutral');
    this.aiHint.set('');
    
    let problem: MathProblem;
    switch (this.selectedMathMode()) {
      case MathMode.Add: problem = this.mathService.generateAddition(); break;
      case MathMode.Sub: problem = this.mathService.generateSubtraction(); break;
      case MathMode.Div: 
        problem = this.mathService.generateDivision(this.specificDivisor() || undefined); 
        break;
      case MathMode.Mixed: problem = this.mathService.generateMixed(); break;
      default: problem = this.mathService.generateAddition();
    }
    this.currentProblem.set(problem);

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
    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - this.sessionStartTime()) / 1000);
    this.sessionTotalTimeSeconds.set(durationSeconds);

    this.stopTimer();
    this.appMode.set(AppMode.Summary);
  }

  // --- Interaction Handlers ---

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

  checkAnswer() {
    const problem = this.currentProblem();
    if (!problem || !this.userAnswer()) return;
    
    const guess = parseInt(this.userAnswer(), 10);
    const correct = problem.answer;

    if (guess === correct) {
      this.stopTimer();
      this.feedbackType.set('success');
      this.feedbackMessage.set(this.i18n.t('correct'));
      this.score.update(s => s + 10);
      setTimeout(() => {
        this.nextQuestion();
      }, 1500);
    } else {
      this.feedbackType.set('error');
      this.score.update(s => Math.max(0, s - 5));
      this.userAnswer.set('');

      let msg = this.i18n.t('tryAgain');
      if (problem.type === 'div') {
        const dividend = problem.operand1;
        const divisor = problem.operand2;
        const result = divisor * guess;
        if (guess > correct) {
          msg = this.i18n.t('divGuessTooHigh', { divisor, guess, result, dividend });
        } else {
          const remainder = dividend - result;
          msg = this.i18n.t('divGuessTooLow', { divisor, guess, result, remainder });
        }
      } else {
        msg = guess > correct ? this.i18n.t('guessTooHigh') : this.i18n.t('guessTooLow');
      }
      this.feedbackMessage.set(msg);

      if (!this.timerInterval) {
         this.timerInterval = setInterval(() => {
          this.timerSeconds.update(s => s + 1);
        }, 1000);
      }
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
      mode: this.selectedMathMode(),
      date: new Date(),
      timeSpentSeconds: this.sessionTotalTimeSeconds()
    };

    await this.leaderboardService.addScore(entry);
    this.showLeaderboard();
  }

  async showLeaderboard() {
    this.appMode.set(AppMode.Leaderboard);
    const data = await this.leaderboardService.getTopScores();
    this.leaderboardData.set(data);
  }
}