import { Component, output, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-changelog',
  standalone: true,
  templateUrl: './changelog.component.html'
})
export class ChangelogComponent {
  closeClicked = output<void>();
  i18n = inject(I18nService);

  /**
   * @description 當使用者點擊關閉按鈕或背景時，通知父元件關閉視窗。
   */
  close() {
    this.closeClicked.emit();
  }
}