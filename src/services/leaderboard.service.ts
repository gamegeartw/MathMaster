import { Injectable, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, Firestore, Timestamp } from 'firebase/firestore';
import { MathMode } from '../app.types';

export interface ScoreEntry {
  name: string;
  score: number;
  mode: MathMode;
  date: Date;
  timeSpentSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private db: Firestore | null = null;
  private app: FirebaseApp | null = null;
  private readonly COLLECTION_NAME = 'math_scores';
  private useLocalStorage = false;

  /**
   * @description LeaderboardService 的建構子。
   * @description 負責初始化 Firebase 連線。如果 Firebase 設定不完整或初始化失敗，
   * @description 會自動切換到使用瀏覽器的 LocalStorage 作為備援儲存機制。
   */
  constructor() {
    // 使用點表示法取得環境變數，以避免在某些嚴格的取代邏輯中出錯
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    // 只有在 apiKey 存在時才嘗試初始化 Firebase，否則直接使用 LocalStorage
    if (firebaseConfig.apiKey) {
      try {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
      } catch (e) {
        console.warn('Firebase init failed, falling back to LocalStorage', e);
        this.useLocalStorage = true;
      }
    } else {
      console.warn('No Firebase Config found. Using LocalStorage mode.');
      this.useLocalStorage = true;
    }
  }

  /**
   * @description 新增一筆分數紀錄。
   * @description 會根據服務的初始化狀態，自動選擇將紀錄儲存到 Firebase 或 LocalStorage。
   * @param entry - 要新增的分數物件，包含姓名、分數等資訊。
   * @returns {Promise<void>} 一個 Promise，在操作完成後解析。
   */
  async addScore(entry: ScoreEntry): Promise<void> {
    if (this.useLocalStorage || !this.db) {
      this.addLocalScore(entry);
      return;
    }

    try {
      await addDoc(collection(this.db, this.COLLECTION_NAME), {
        ...entry,
        date: Timestamp.fromDate(entry.date)
      });
    } catch (e) {
      console.error('Error adding score to Firebase:', e);
      // 如果 Firebase 寫入失敗，則降級儲存到本地
      this.addLocalScore(entry);
    }
  }

  /**
   * @description 取得最高分的排行榜紀錄。
   * @description 會根據服務的初始化狀態，自動從 Firebase 或 LocalStorage 讀取資料。
   * @param limitCount - 要取得的紀錄筆數，預設為 10。
   * @returns {Promise<ScoreEntry[]>} 一個 Promise，解析後回傳分數物件的陣列。
   */
  async getTopScores(limitCount: number = 10): Promise<ScoreEntry[]> {
    if (this.useLocalStorage || !this.db) {
      return this.getLocalTopScores(limitCount);
    }

    try {
      const q = query(
        collection(this.db, this.COLLECTION_NAME),
        orderBy('score', 'desc'),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data['name'],
          score: data['score'],
          mode: data['mode'] as MathMode,
          date: (data['date'] as Timestamp).toDate(),
          timeSpentSeconds: data['timeSpentSeconds'] || 0
        };
      });
    } catch (e) {
      console.error('Error fetching scores from Firebase:', e);
      // 如果 Firebase 讀取失敗，則降級從本地讀取
      return this.getLocalTopScores(limitCount);
    }
  }

  // --- Local Storage 備援機制實作 ---

  /**
   * @description (私有) 從 LocalStorage 取得所有分數紀錄。
   * @returns {ScoreEntry[]} 儲存在本地的分數陣列。
   */
  private getLocalScores(): ScoreEntry[] {
    const raw = localStorage.getItem(this.COLLECTION_NAME);
    if (!raw) return [];
    return JSON.parse(raw).map((item: any) => ({
      ...item,
      date: new Date(item.date)
    }));
  }

  /**
   * @description (私有) 將一筆分數紀錄新增到 LocalStorage。
   * @param entry - 要新增的分數物件。
   */
  private addLocalScore(entry: ScoreEntry) {
    const scores = this.getLocalScores();
    scores.push(entry);
    localStorage.setItem(this.COLLECTION_NAME, JSON.stringify(scores));
  }

  /**
   * @description (私有) 從 LocalStorage 取得排序後的最高分紀錄。
   * @param limitCount - 要取得的紀錄筆數。
   * @returns {ScoreEntry[]} 經過排序和數量限制的分數陣列。
   */
  private getLocalTopScores(limitCount: number): ScoreEntry[] {
    const scores = this.getLocalScores();
    return scores
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.date.getTime() - a.date.getTime();
      })
      .slice(0, limitCount);
  }
}