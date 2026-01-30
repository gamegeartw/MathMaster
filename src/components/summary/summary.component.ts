import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './summary.component.html'
})
export class SummaryComponent {
  score = input.required<number>();
  sessionTotalTimeSeconds = input.required<number>();
  playerName = input.required<string>();
  
  playerNameChange = output<string>();
  scoreSubmitted = output<void>();

  i18n = inject(I18nService);

  /**
   * @description 將總秒數格式化為 "分:秒" (M:SS) 的字串。
   * @example
   * formatTime(75) // returns "1:15"
   * formatTime(59) // returns "0:59"
   * @param totalSeconds - 要格式化的總秒數。
   * @returns {string} 格式化後的時間字串。
   */
  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}