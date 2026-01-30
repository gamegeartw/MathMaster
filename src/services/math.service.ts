import { Injectable, inject } from '@angular/core';
import { I18nService } from './i18n.service';

export interface MathProblem {
  type: 'add' | 'sub' | 'div' | 'mul';
  questionStr: string;
  answer: number;
  hintPrompt: string; // For GenAI
  // Added for specific logic hints
  operand1: number; 
  operand2: number;
}

@Injectable({
  providedIn: 'root'
})
export class MathService {
  i18n = inject(I18nService);

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateAddition(): MathProblem {
    // 21-70 arbitrary two numbers
    const a = this.getRandomInt(21, 70);
    const b = this.getRandomInt(21, 70);
    return {
      type: 'add',
      questionStr: `${a} + ${b} = ?`,
      answer: a + b,
      hintPrompt: this.i18n.t('addHintPrompt', { a, b }),
      operand1: a,
      operand2: b
    };
  }

  generateSubtraction(): MathProblem {
    // 21-70, result non-negative
    let a = this.getRandomInt(21, 70);
    let b = this.getRandomInt(21, 70);
    if (b > a) {
      [a, b] = [b, a]; // Swap to ensure positive result
    }
    return {
      type: 'sub',
      questionStr: `${a} - ${b} = ?`,
      answer: a - b,
      hintPrompt: this.i18n.t('subHintPrompt', { a, b }),
      operand1: a,
      operand2: b
    };
  }

  generateDivision(specificDivisor?: number): MathProblem {
    // If specificDivisor is provided, use it. Otherwise random 2-9.
    const divisor = specificDivisor || this.getRandomInt(2, 9);
    
    // Range: Divisor N -> Dividend N to (N*10 - 1)
    const minDividend = divisor;
    const maxDividend = (divisor * 10) - 1;
    const dividend = this.getRandomInt(minDividend, maxDividend);
    
    // Integer division (quotient)
    const answer = Math.floor(dividend / divisor);

    return {
      type: 'div',
      questionStr: `${dividend} ÷ ${divisor} = ?`,
      answer: answer,
      hintPrompt: this.i18n.t('divHintPrompt', { dividend, divisor }),
      operand1: dividend, // 被除數
      operand2: divisor   // 除數
    };
  }

  generateMixed(): MathProblem {
    const r = Math.random();
    if (r < 0.33) return this.generateAddition();
    if (r < 0.66) return this.generateSubtraction();
    return this.generateDivision(); // Random 2-9 for mixed mode
  }
}