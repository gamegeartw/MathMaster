import { Component, output, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-divisor-select',
  standalone: true,
  templateUrl: './divisor-select.component.html'
})
export class DivisorSelectComponent {
  divisorSelected = output<number>();
  backClicked = output<void>();
  
  i18n = inject(I18nService);
  divisors = [2, 3, 4, 5, 6, 7, 8, 9];

  /**
   * @description 當使用者選擇一個除數時，將該數字發射給父元件。
   * @param num - 使用者點擊的除數按鈕上的數字。
   */
  selectDivisor(num: number) {
    this.divisorSelected.emit(num);
  }

  /**
   * @description 當使用者點擊返回按鈕時，通知父元件。
   */
  returnToMenu() {
    this.backClicked.emit();
  }
}