import { Injectable } from '@angular/core';
import { zhTW } from '../i18n/zh-TW';

// Create a type from the keys of our dictionary to provide type safety.
export type I18nKey = keyof typeof zhTW;

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private dictionary = zhTW;

  /**
   * Translates a key into a string.
   * @param key The key from the dictionary file (e.g., 'appTitle').
   * @param params An object for replacing placeholders in the string (e.g., { current: 1, total: 10 }).
   * @returns The translated string.
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
