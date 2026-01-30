import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MathProblem } from '../../services/math.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html'
})
export class GameComponent {
  questionCount = input.required<number>();
  totalQuestions = input.required<number>();
  score = input.required<number>();
  currentProblem = input.required<MathProblem | null>();
  modeTitle = input.required<string>();
  feedbackMessage = input.required<string>();
  feedbackType = input.required<'success' | 'error' | 'neutral'>();
  aiHint = input.required<string>();
  isLoadingAi = input.required<boolean>();
  isSpeaking = input.required<boolean>();
  timerSeconds = input.required<number>();
  isTimeWarning = input.required<boolean>();
  userAnswer = input.required<string>();

  answerChecked = output<void>();
  helpRequested = output<void>();
  stopSpeechClicked = output<void>();
  numberAppended = output<number>();
  backspaceClicked = output<void>();

  i18n = inject(I18nService);
  keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  /**
   * @description 處理 AI 老師按鈕的點擊事件。
   * @description 如果正在朗讀提示，則觸發停止事件；否則，觸發請求幫助事件。
   * @description 在 AI 正在思考時會禁用此按鈕，防止重複點擊。
   */
  onHelpButtonClick() {
    if (this.isSpeaking()) {
      this.stopSpeechClicked.emit();
    } else if (!this.isLoadingAi()){
      this.helpRequested.emit();
    }
  }
}