import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class AiTutorService {
  private ai: GoogleGenAI;

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
          systemInstruction: "你是一位親切、充滿鼓勵的台灣國小數學老師。請用繁體中文（台灣用語）回答。解釋要非常簡短（最多3句話），簡單易懂且有趣。",
        }
      });
      return response.text || "抱歉，我現在想不出提示！";
    } catch (error) {
      console.error('AI Error:', error);
      return "哎呀！我現在腦袋在休息，你自己試試看吧！";
    }
  }
}