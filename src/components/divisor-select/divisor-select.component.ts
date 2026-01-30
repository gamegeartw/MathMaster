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

  selectDivisor(num: number) {
    this.divisorSelected.emit(num);
  }

  returnToMenu() {
    this.backClicked.emit();
  }
}