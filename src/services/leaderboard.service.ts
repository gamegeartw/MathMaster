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

  constructor() {
    // Use dot notation for environment variables to avoid syntax errors if replacement logic is strict
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };

    // Initialize Firebase only if config is somewhat valid, else fallback to local storage
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
      // Fallback
      this.addLocalScore(entry);
    }
  }

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
      return this.getLocalTopScores(limitCount);
    }
  }

  // --- Local Storage Fallback Implementation ---

  private getLocalScores(): ScoreEntry[] {
    const raw = localStorage.getItem(this.COLLECTION_NAME);
    if (!raw) return [];
    return JSON.parse(raw).map((item: any) => ({
      ...item,
      date: new Date(item.date)
    }));
  }

  private addLocalScore(entry: ScoreEntry) {
    const scores = this.getLocalScores();
    scores.push(entry);
    localStorage.setItem(this.COLLECTION_NAME, JSON.stringify(scores));
  }

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