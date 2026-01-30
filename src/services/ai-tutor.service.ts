import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class AiTutorService {
  private ai: GoogleGenAI;
  private i18n = inject(I18nService);

  constructor() {
    // 嚴格依照規範，使用點表示法取得環境變數
    const apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * @description 根據提供的提示文字，向 Google Gemini API 請求解說。
   * @description 此方法會帶上預設的系統指令，要求 AI 扮演一位親切的國小數學老師。
   * @param prompt - 發送給 AI 模型的問題或提示字串。
   * @returns {Promise<string>} 一個 Promise，解析後會回傳 AI 生成的文字回覆。如果發生錯誤，則回傳預設的錯誤訊息。
   */
  async getExplanation(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: this.i18n.t('aiSystemInstruction'),
        }
      });
      return response.text || this.i18n.t('aiHintError');
    } catch (error) {
      console.error('AI Error:', error);
      return this.i18n.t('aiGenericError');
    }
  }
}