import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center w-full h-full animate-fade-in gap-3 p-4">
      <div class="text-5xl">🎉</div>
      <h2 class="text-2xl font-bold text-slate-800">測驗結束！</h2>
      
      <div class="bg-white p-4 rounded-3xl shadow-lg w-full text-center border-b-4 border-slate-100">
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-gray-500 text-sm">你的總分</div>
            <div class="text-5xl font-bold text-indigo-600">{{ score() }}</div>
          </div>
          <div>
            <div class="text-gray-500 text-sm">花費時間</div>
            <div class="text-4xl font-bold text-slate-700">
              {{ formatTime(sessionTotalTimeSeconds()) }}
            </div>
          </div>
        </div>
        
        <div class="mt-4 text-left">
          <label class="block text-sm font-bold text-slate-700 mb-1">輸入名字:</label>
          <input type="text" 
            [ngModel]="playerName()" 
            (ngModelChange)="playerNameChange.emit($event)"
            placeholder="例如: 小明" 
            class="w-full p-3 rounded-xl border-2 border-slate-200 text-lg focus:border-indigo-500 outline-none">
        </div>
      </div>

      <button (click)="scoreSubmitted.emit()" [disabled]="!playerName() || playerName().trim().length === 0"
        class="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        查看排名 🏆
      </button>
    </div>
  `
})
export class SummaryComponent {
  score = input.required<number>();
  sessionTotalTimeSeconds = input.required<number>();
  playerName = input.required<string>();
  
  playerNameChange = output<string>();
  scoreSubmitted = output<void>();

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
