import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  isSpeaking = signal(false);
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  /**
   * @description VoiceService 的建構子。
   * @description 負責初始化瀏覽器的語音合成 API。如果瀏覽器不支援，會在主控台顯示警告。
   * @description 它也會註冊事件來取得可用的語音列表。
   */
  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // 綁定 this，確保在回呼中能正確引用 loadVoices 方法
      this.loadVoices = this.loadVoices.bind(this);
      // 立即載入一次，並設定監聽器以應對語音列表的動態變化
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = this.loadVoices;
      }
    } else {
      console.warn('Web Speech API not supported in this browser.');
    }
  }

  /**
   * @description (私有) 載入並更新可用的語音列表。
   */
  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  /**
   * @description 朗讀指定的文字。
   * @param text - 要轉換為語音的文字字串。
   * @param lang - 目標語言代碼，預設為 'zh-TW' (繁體中文-台灣)。
   * @returns {Promise<void>} 一個 Promise，在朗讀結束後解析，或在發生錯誤時拒絕。
   */
  speak(text: string, lang: string = 'zh-TW'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth || !text) {
        this.isSpeaking.set(false);
        return reject('Speech synthesis not available or text is empty.');
      }

      // 如果正在朗讀，先取消上一個
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => this.isSpeaking.set(true);
      utterance.onend = () => {
        this.isSpeaking.set(false);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        this.isSpeaking.set(false);
        reject(event);
      };
      
      // 智慧型語音選擇邏輯：優先尋找符合語言且名稱包含 'Female' 的女聲
      let femaleVoice = this.voices.find(v => v.lang === lang && (v.name.includes('Female') || v.name.includes('女')));
      if (!femaleVoice) { // 如果找不到，退而求其次，找任何符合語言的聲音
          femaleVoice = this.voices.find(v => v.lang === lang);
      }
      if (!femaleVoice) { // 再找不到，嘗試尋找任何中文女聲
          femaleVoice = this.voices.find(v => v.lang.startsWith('zh-') && (v.name.includes('Female') || v.name.includes('女')));
      }
      if (!femaleVoice) { // 最後的備援，找任何中文聲音
          femaleVoice = this.voices.find(v => v.lang.startsWith('zh-'));
      }
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        console.warn(`No suitable voice found for lang '${lang}'. Using browser default.`);
      }

      utterance.lang = lang;
      utterance.pitch = 1;
      utterance.rate = 1;

      this.synth.speak(utterance);
    });
  }

  /**
   * @description 立即停止當前正在進行的所有朗讀。
   */
  cancel() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      // 手動更新狀態，因為 onend 在 cancel 時可能不會可靠地觸發
      this.isSpeaking.set(false); 
    }
  }
}
