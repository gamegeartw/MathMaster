import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MathService, MathProblem } from './services/math.service';
import { AiTutorService } from './services/ai-tutor.service';
import { LeaderboardService, ScoreEntry } from './services/leaderboard.service';
import { I18nService } from './services/i18n.service';
import { VoiceService } from './services/voice.service';

import { MenuComponent } from './components/menu/menu.component';
import { DivisorSelectComponent } from './components/divisor-select/divisor-select.component';
import { GameComponent } from './components/game/game.component';
import { SummaryComponent } from './components/summary/summary.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { ChangelogComponent } from './components/changelog/changelog.component';
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
    LeaderboardComponent,
    ChangelogComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {
  mathService = inject(MathService);
  aiService = inject(AiTutorService);
  leaderboardService = inject(LeaderboardService);
  i18n = inject(I18nService);
  voiceService = inject(VoiceService);

  // App Info
  version = signal<string>('v1.6.0');

  // Expose enums to template
  AppMode = AppMode;

  // --- State Signals ---
  appMode = signal<AppMode>(AppMode.Menu);
  showChangelog = signal<boolean>(false);
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
  isSpeaking = this.voiceService.isSpeaking; // 建立一個唯讀 signal 來追蹤語音服務的狀態

  // Timers
  timerSeconds = signal<number>(0);
  timerInterval: any;
  sessionStartTime = signal<number>(0);
  sessionTotalTimeSeconds = signal<number>(0);
  sessionElapsedTime = signal<number>(0);
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

  // --- UI Flow ---
  toggleChangelog(forceClose: boolean = false) {
    if (forceClose) {
      this.showChangelog.set(false);
    } else {
      this.showChangelog.update(v => !v);
    }
  }

  // --- Game Flow & Event Handlers ---

  /**
   * @description 處理自訂題目數量的變更事件。
   * @description 如果輸入值為負數，會將其重設為 null。
   * @param value - 從輸入框傳來的新數值，可以是數字或 null。
   */
  handleCustomQuestionCountChange(value: number | null) {
    if (value !== null && value < 0) {
      this.customQuestionCount.set(null);
    } else {
      this.customQuestionCount.set(value);
    }
  }

  /**
   * @description 根據使用者在主選單的選擇，設定練習模式並開始遊戲。
   * @description 如果選擇的是估商模式，會先切換到除數選擇畫面。
   * @param mode - 使用者選擇的數學練習模式 (MathMode)。
   */
  selectMode(mode: MathMode) {
    if (mode === MathMode.Div) {
      this.appMode.set(AppMode.DivSelect);
    } else {
      this.selectedMathMode.set(mode);
      this.specificDivisor.set(null);
      this.initializeGame();
    }
  }

  /**
   * @description 在估商模式中，設定使用者選擇的除數並開始遊戲。
   * @param num - 使用者選擇的除數 (2-9)。
   */
  selectDivisor(num: number) {
    this.selectedMathMode.set(MathMode.Div);
    this.specificDivisor.set(num);
    this.initializeGame();
  }

  /**
   * @description 初始化一場新的遊戲。
   * @description 會根據模式設定總題數、重設分數和計數器，並載入第一題。
   */
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
    this.sessionElapsedTime.set(0);
    this.nextQuestion();
  }

  /**
   * @description 返回主選單。
   * @description 會停止計時器、停止語音並重設所有遊戲相關的狀態。
   */
  returnToMenu() {
    this.stopTimer();
    this.voiceService.cancel();
    this.appMode.set(AppMode.Menu);
    this.currentProblem.set(null);
    this.userAnswer.set('');
    this.feedbackMessage.set('');
    this.aiHint.set('');
    this.specificDivisor.set(null);
    this.sessionElapsedTime.set(0);
  }

  /**
   * @description 載入下一道題目。
   * @description 如果已達總題數，則結束遊戲；否則，產生新題目並重設計時器。
   */
  nextQuestion() {
    if (this.questionCount() >= this.totalQuestions()) {
      this.finishGame();
      return;
    }

    this.stopTimer();
    this.voiceService.cancel();
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
      const elapsed = Math.round((Date.now() - this.sessionStartTime()) / 1000);
      this.sessionElapsedTime.set(elapsed);
    }, 1000);
  }

  /**
   * @description 停止當前題目的計時器。
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * @description 結束遊戲流程。
   * @description 計算總花費時間，並切換到總結畫面。
   */
  finishGame() {
    // 使用最後一次更新的總耗時，而不是重新計算，以避免包含最後一題的延遲時間
    this.sessionTotalTimeSeconds.set(this.sessionElapsedTime());

    this.stopTimer();
    this.voiceService.cancel();
    this.appMode.set(AppMode.Summary);
  }

  // --- Interaction Handlers ---

  /**
   * @description 從數字鍵盤附加一個數字到答案區。
   * @param num - 要附加的數字 (0-9)。
   */
  appendNumber(num: number) {
    if (this.feedbackType() === 'success') return;
    const current = this.userAnswer();
    if (current.length < 5) {
      this.userAnswer.set(current + num.toString());
    }
  }

  /**
   * @description 從答案區刪除最後一個數字 (退格)。
   */
  backspace() {
    if (this.feedbackType() === 'success') return;
    const current = this.userAnswer();
    this.userAnswer.set(current.slice(0, -1));
  }

  /**
   * @description 檢查使用者輸入的答案是否正確。
   * @description 根據結果給予回饋、更新分數，並在答對時自動進入下一題。
   */
  checkAnswer() {
    const problem = this.currentProblem();
    if (!problem || !this.userAnswer()) return;
    
    const guess = parseInt(this.userAnswer(), 10);
    const correct = problem.answer;

    if (guess === correct) {
      this.stopTimer();
      this.voiceService.cancel();
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
          const elapsed = Math.round((Date.now() - this.sessionStartTime()) / 1000);
          this.sessionElapsedTime.set(elapsed);
        }, 1000);
      }
    }
  }

  /**
   * @description 向 AI 老師請求幫助並朗讀提示。
   * @description 會呼叫 AI Tutor 服務來取得提示，然後使用 VoiceService 朗讀出來。
   */
  async askForHelp() {
    const problem = this.currentProblem();
    if (!problem) return;

    this.isLoadingAi.set(true);
    this.aiHint.set('');
    try {
      const hint = await this.aiService.getExplanation(problem.hintPrompt);
      this.aiHint.set(hint);
      this.isLoadingAi.set(false);
      // 成功取得提示後，立即朗讀
      await this.voiceService.speak(hint, 'zh-TW');
    } catch (error) {
      console.error('Failed to get or speak AI hint:', error);
      this.isLoadingAi.set(false);
    }
  }

  /**
   * @description 停止 AI 老師的朗讀。
   */
  stopSpeech() {
    this.voiceService.cancel();
  }

  // --- Leaderboard Logic ---

  /**
   * @description 提交分數到排行榜。
   * @description 只有在輸入玩家名稱後才能提交。
   */
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

  /**
   * @description 顯示排行榜畫面。
   * @description 會先從服務取得最新的排行榜資料，然後切換到排行榜畫面。
   */
  async showLeaderboard() {
    this.appMode.set(AppMode.Leaderboard);
    const data = await this.leaderboardService.getTopScores();
    this.leaderboardData.set(data);
  }
}