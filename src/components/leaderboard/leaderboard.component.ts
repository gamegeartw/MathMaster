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

  getModeDisplayName(mode: MathMode): string {
    switch (mode) {
      case MathMode.Add: return this.i18n.t('addition');
      case MathMode.Sub: return this.i18n.t('subtraction');
      case MathMode.Div: return this.i18n.t('division');
      case MathMode.Mixed: return this.i18n.t('mixed');
      default: return '?';
    }
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}