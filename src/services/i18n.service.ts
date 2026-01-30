import { Injectable } from '@angular/core';
import { zhTW } from '../i18n/zh-TW';

// 從字典檔的 key 建立一個型別，以提供型別安全檢查。
export type I18nKey = keyof typeof zhTW;

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private dictionary = zhTW;

  /**
   * @description 將一個 i18n 鍵值翻譯成對應的文字字串。
   * @description 此方法支援使用大括號 `{}` 的佔位符替換。
   * @example
   * t('appTitle') // returns '數學大師五年級'
   * t('questionProgress', { current: 1, total: 10 }) // returns '第 1/10 題'
   * @param key - 字典檔中的鍵值 (例如 'appTitle')。
   * @param params - (可選) 一個用於替換字串中佔位符的物件。
   * @returns {string} 翻譯後的文字字串。如果找不到對應的鍵值，則直接回傳原始的 key。
   */
  t(key: I18nKey, params?: { [key: string]: string | number }): string {
    let translation: string = this.dictionary[key] || key;
    
    if (params) {
      for (const paramKey in params) {
        if (Object.prototype.hasOwnProperty.call(params, paramKey)) {
          const regex = new RegExp(`{${paramKey}}`, 'g');
          translation = translation.replace(regex, String(params[paramKey]));
        }
      }
    }
    
    return translation;
  }
}