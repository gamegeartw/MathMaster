import { Component, output, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-divisor-select',
  standalone: true,
  template: `
    <div class="flex flex-col gap-3 w-full h-full animate-fade-in overflow-y-auto">
      <h1 class="text-xl font-bold text-center text-slate-800 shrink-0">{{ i18n.t('selectDivisor') }}</h1>
      
      <div class="grid grid-cols-2 gap-3 flex-1 content-start">
        @for (num of divisors; track num) {
          <button (click)="selectDivisor(num)"
            class="h-20 rounded-2xl bg-white border-2 border-purple-100 hover:border-purple-500 hover:bg-purple-50 text-purple-600 text-3xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center">
            {{ num }}
          </button>
        }
      </div>

      <button (click)="returnToMenu()" class="shrink-0 mb-2 w-full py-3 text-slate-400 font-bold border border-slate-200 rounded-xl">
        {{ i18n.t('cancelAndReturn') }}
      </button>
    </div>
  `
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