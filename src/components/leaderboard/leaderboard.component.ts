import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreEntry } from '../../services/leaderboard.service';
import { MathMode } from '../../app.types';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html'
})
export class LeaderboardComponent {
  leaderboardData = input.required<ScoreEntry[]>();
  backClicked = output<void>();

  i18n = inject(I18nService);

  /**
   * @description 將 MathMode 的枚舉值轉換為可供顯示的中文名稱。
   * @param mode - MathMode 的枚舉值，例如 MathMode.Add。
   * @returns {string} 對應的中文模式名稱，例如 "加法"。
   */
  getModeDisplayName(mode: MathMode): string {
    switch (mode) {
      case MathMode.Add: return this.i18n.t('addition');
      case MathMode.Sub: return this.i18n.t('subtraction');
      case MathMode.Div: return this.i18n.t('division');
      case MathMode.Mixed: return this.i18n.t('mixed');
      default: return '?';
    }
  }

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