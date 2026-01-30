import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MathMode } from '../../app.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-3 w-full h-full animate-fade-in overflow-y-auto pb-4">
      
      <div class="w-full bg-white p-3 rounded-xl shadow-sm border border-slate-200 shrink-0">
        <div class="flex items-center justify-between">
            <label class="text-slate-600 font-bold text-sm">
            ⚙️ 每回合題數
          </label>
          <input type="number" 
            min="0"
            [ngModel]="customQuestionCount()" 
            (ngModelChange)="handleCustomQuestionCountChange($event)" 
            placeholder="預設"
            class="w-20 p-1 rounded-lg border-2 border-slate-200 focus:border-indigo-500 outline-none text-center font-bold text-sm">
        </div>
      </div>

      <h1 class="text-xl font-bold text-center text-slate-800 my-1 shrink-0">請選擇練習模式</h1>
      
      <div class="grid grid-cols-2 gap-3 flex-1 min-h-0 content-start">
        <button (click)="selectMode('add')" 
          class="aspect-[4/3] rounded-2xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg transform transition active:scale-95 flex flex-col items-center justify-center gap-1 p-2">
          <span class="text-3xl">➕</span> 
          <span class="text-xl font-bold">加法</span>
        </button>

        <button (click)="selectMode('sub')" 
          class="aspect-[4/3] rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-lg transform transition active:scale-95 flex flex-col items-center justify-center gap-1 p-2">
          <span class="text-3xl">➖</span> 
          <span class="text-xl font-bold">減法</span>
        </button>

        <button (click)="selectMode('div')" 
          class="aspect-[4/3] rounded-2xl bg-purple-500 hover:bg-purple-600 text-white shadow-lg transform transition active:scale-95 flex flex-col items-center justify-center gap-1 p-2">
          <span class="text-3xl">➗</span> 
          <span class="text-xl font-bold">估商</span>
        </button>
        
        <button (click)="selectMode('mixed')" 
          class="aspect-[4/3] rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg transform transition active:scale-95 flex flex-col items-center justify-center gap-1 p-2">
          <span class="text-3xl">🎲</span> 
          <span class="text-xl font-bold">綜合</span>
        </button>
      </div>

      <button (click)="showLeaderboard()" 
        class="shrink-0 w-full py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold shadow flex items-center justify-center gap-2">
        <span>🏆</span> 查看排行榜
      </button>

      <div class="shrink-0 text-center text-gray-400 text-xs">
        適用五年級 • 範圍 21-70
      </div>
    </div>
  `
})
export class MenuComponent {
  customQuestionCount = input.required<number | null>();
  customQuestionCountChange = output<number | null>();
  modeSelected = output<MathMode>();
  leaderboardClicked = output<void>();

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
