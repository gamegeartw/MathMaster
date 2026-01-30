import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MathMode } from '../../app.types';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './menu.component.html'
})
export class MenuComponent {
  customQuestionCount = input.required<number | null>();
  customQuestionCountChange = output<number | null>();
  modeSelected = output<MathMode>();
  leaderboardClicked = output<void>();

  i18n = inject(I18nService);
  MathMode = MathMode;

  handleCustomQuestionCountChange(value: number | null) {
    this.customQuestionCountChange.emit(value);
  }

  selectMode(mode: MathMode) {
    this.modeSelected.emit(mode);
  }

  showLeaderboard() {
    this.leaderboardClicked.emit();
  }
}