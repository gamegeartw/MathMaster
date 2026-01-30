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
  timerSeconds = input.required<number>();
  isTimeWarning = input.required<boolean>();
  userAnswer = input.required<string>();

  answerChecked = output<void>();
  helpRequested = output<void>();
  numberAppended = output<number>();
  backspaceClicked = output<void>();

  i18n = inject(I18nService);
  keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
}