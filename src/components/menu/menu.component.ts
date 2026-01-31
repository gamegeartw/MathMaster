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
  version = input.required<string>();
  customQuestionCount = input.required<number | null>();
  customQuestionCountChange = output<number | null>();
  modeSelected = output<MathMode>();
  leaderboardClicked = output<void>();

  i18n = inject(I18nService);
  MathMode = MathMode;

  /**
   * @description 處理自訂題目數量輸入框的變更，並將新值發射給父元件。
   * @param value - 輸入框的最新數值。
   */
  handleCustomQuestionCountChange(value: number | null) {
    this.customQuestionCountChange.emit(value);
  }

  /**
   * @description 當使用者點擊一個模式按鈕時，將所選模式發射給父元件。
   * @param mode - 被點擊的練習模式 (MathMode)。
   */
  selectMode(mode: MathMode) {
    this.modeSelected.emit(mode);
  }

  /**
   * @description 當使用者點擊「查看排行榜」按鈕時，通知父元件。
   */
  showLeaderboard() {
    this.leaderboardClicked.emit();
  }
}