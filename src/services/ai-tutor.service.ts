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
    // Use dot notation strictly as per guidelines
    const apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

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