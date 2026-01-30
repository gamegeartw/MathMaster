import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreEntry } from '../../services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col w-full h-full animate-fade-in pb-2">
      <h2 class="text-xl font-bold text-slate-800 mb-2 text-center shrink-0">🏆 排行榜</h2>
      
      <div class="bg-white rounded-2xl shadow-lg w-full overflow-hidden flex-1 mb-2 flex flex-col min-h-0">
        <div class="p-3 bg-indigo-50 border-b border-indigo-100 grid grid-cols-12 gap-2 text-xs sm:text-sm font-bold text-indigo-900 shrink-0">
          <div class="col-span-1">#</div>
          <div class="col-span-4">姓名</div>
          <div class="col-span-3 text-center">模式</div>
          <div class="col-span-2 text-center">時間</div>
          <div class="col-span-2 text-right">分數</div>
        </div>
        
        <div class="overflow-y-auto flex-1 p-0">
          @for (entry of leaderboardData(); track $index) {
            <div class="p-3 border-b border-slate-100 grid grid-cols-12 gap-2 items-center text-xs sm:text-sm" 
                  [class.bg-yellow-50]="$index < 3">
              <div class="col-span-1 font-bold text-slate-500">
                @if ($index === 0) { 🥇 }
                @else if ($index === 1) { 🥈 }
                @else if ($index === 2) { 🥉 }
                @else { {{ $index + 1 }} }
              </div>
              <div class="col-span-4 font-bold text-slate-800 truncate">{{ entry.name }}</div>
              <div class="col-span-3 text-center text-slate-500 bg-slate-100 rounded-full py-0.5 px-1">
                  {{ getModeDisplayName(entry.mode) }}
              </div>
              <div class="col-span-2 text-center font-mono text-slate-600">
                {{ formatTime(entry.timeSpentSeconds) }}
              </div>
              <div class="col-span-2 text-right font-mono text-indigo-600 font-bold">{{ entry.score }}</div>
            </div>
          }
          @if (leaderboardData().length === 0) {
            <div class="p-8 text-center text-gray-400 text-sm">
              目前還沒有紀錄，快去挑戰吧！
            </div>
          }
        </div>
      </div>

      <button (click)="backClicked.emit()" 
        class="shrink-0 w-full py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-lg shadow hover:bg-slate-300">
        回主選單
      </button>
    </div>
  `
})
export class LeaderboardComponent {
  leaderboardData = input.required<ScoreEntry[]>();
  backClicked = output<void>();

  getModeDisplayName(mode: string): string {
    switch (mode) {
      case 'add': return '加法';
      case 'sub': return '減法';
      case 'div': return '估商';
      case 'mixed': return '綜合';
      default: return '未知';
    }
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
