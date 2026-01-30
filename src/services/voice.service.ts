import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  isListening = signal<boolean>(false);
  error = signal<string>('');
  
  private recognition: any;

  constructor() {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'cmn-Hant-TW'; // Traditional Chinese (Taiwan)
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening.set(true);
        this.error.set('');
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening.set(false);
        let msg = '語音辨識錯誤，請手動輸入';
        
        if (event.error === 'not-allowed') {
          msg = '請至瀏覽器設定允許使用麥克風權限 🎤';
        } else if (event.error === 'no-speech') {
          msg = '沒有聽到聲音，請再試一次 🔊';
        } else if (event.error === 'network') {
          msg = '網路連線不穩，無法使用語音';
        }

        this.error.set(msg);
        console.error('Speech recognition error', event.error);
      };
    }
  }

  startListening(callback: (result: string) => void) {
    this.error.set(''); // Clear previous errors immediately

    if (!this.recognition) {
      this.error.set('您的瀏覽器不支援語音輸入');
      return;
    }

    if (this.isListening()) {
      this.recognition.stop();
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      callback(transcript);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error(e);
      this.error.set('無法啟動麥克風，請重整頁面後再試');
    }
  }
}