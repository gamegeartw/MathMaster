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

  /**
   * @description 產生一個介於最小值和最大值之間 (包含兩者) 的隨機整數。
   * @param min - 隨機數範圍的下限。
   * @param max - 隨機數範圍的上限。
   * @returns {number} 一個在指定範圍內的整數。
   */
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * @description 產生一道加法問題。
   * @description 題目範圍為 21 至 70 之間的任意兩個數字相加，並確保兩個數字不相同。
   * @returns {MathProblem} 一個包含問題字串、答案和 AI 提示的數學問題物件。
   */
  generateAddition(): MathProblem {
    // 21-70 任意兩個數字，並確保兩數不相等
    const a = this.getRandomInt(21, 70);
    let b = this.getRandomInt(21, 70);
    while (a === b) {
      b = this.getRandomInt(21, 70);
    }
    return {
      type: 'add',
      questionStr: `${a} + ${b} = ?`,
      answer: a + b,
      hintPrompt: this.i18n.t('addHintPrompt', { a, b }),
      operand1: a,
      operand2: b
    };
  }

  /**
   * @description 產生一道減法問題。
   * @description 題目範圍為 21 至 70 之間的數字，確保兩個數字不相同，並確保結果不會是負數。
   * @returns {MathProblem} 一個包含問題字串、答案和 AI 提示的數學問題物件。
   */
  generateSubtraction(): MathProblem {
    // 21-70, 結果為非負數，且兩數不相等
    let a = this.getRandomInt(21, 70);
    let b = this.getRandomInt(21, 70);
    while (a === b) {
      b = this.getRandomInt(21, 70);
    }
    if (b > a) {
      [a, b] = [b, a]; // 交換 a 和 b，確保 a 比較大，結果為正數
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

  /**
   * @description 產生一道乘法問題 (九九乘法表)。
   * @description 如果未提供參數，則隨機產生 2-9 乘以 1-10 的題目。如果提供了參數，則使用指定的數字。
   * @param specificMultiplier - (可選) 指定被乘數。
   * @param specificOperand2 - (可選) 指定乘數。
   * @returns {MathProblem} 一個包含問題字串、答案和 AI 提示的數學問題物件。
   */
  generateMultiplication(specificMultiplier?: number, specificOperand2?: number): MathProblem {
    const a = specificMultiplier || this.getRandomInt(2, 9);
    const b = specificOperand2 || this.getRandomInt(1, 10);
    return {
      type: 'mul',
      questionStr: `${a} × ${b} = ?`,
      answer: a * b,
      hintPrompt: this.i18n.t('mulHintPrompt', { a, b }),
      operand1: a,
      operand2: b
    };
  }

  /**
   * @description 產生一道估商問題。
   * @description 除數可以是指定的數字，或是 2 到 9 之間的隨機數。被除數的範圍會根據除數動態調整，確保商為一位數。
   * @param specificDivisor - (可選) 指定一個特定的除數。如果未提供，則隨機產生。
   * @returns {MathProblem} 一個包含問題字串、答案和 AI 提示的數學問題物件。
   */
  generateDivision(specificDivisor?: number): MathProblem {
    // 如果提供了 specificDivisor，就使用它。否則隨機產生 2-9 的數字。
    const divisor = specificDivisor || this.getRandomInt(2, 9);
    
    // 範圍：除數 N -> 被除數 N 到 (N*10 - 1)
    const minDividend = divisor;
    const maxDividend = (divisor * 10) - 1;
    const dividend = this.getRandomInt(minDividend, maxDividend);
    
    // 只取整數商
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

  /**
   * @description 產生一道綜合型問題。
   * @description 會從加法、減法、乘法、估商中隨機選擇一種題型。
   * @returns {MathProblem} 一個隨機題型的數學問題物件。
   */
  generateMixed(): MathProblem {
    const r = Math.random();
    if (r < 0.25) return this.generateAddition();
    if (r < 0.5) return this.generateSubtraction();
    if (r < 0.75) return this.generateMultiplication();
    return this.generateDivision(); // 在綜合模式中，估商的除數是隨機的
  }
}