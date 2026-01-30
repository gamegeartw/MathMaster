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

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}