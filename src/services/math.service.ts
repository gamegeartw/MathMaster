import { Injectable } from '@angular/core';

export interface MathProblem {
  type: 'add' | 'sub' | 'div' | 'mul';
  questionStr: string;
  answer: number;
  hintPrompt: string; // For GenAI
}

@Injectable({
  providedIn: 'root'
})
export class MathService {

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
      hintPrompt: `請用繁體中文，簡單地向小學五年級學生解釋如何計算 ${a} 加 ${b}。`
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
      hintPrompt: `請用繁體中文，簡單地向小學五年級學生解釋如何計算 ${a} 減 ${b}。`
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
      hintPrompt: `請用繁體中文，簡單解釋如何估算 ${dividend} 除以 ${divisor} 的商數。只要教學生找出整數部分的商即可。`
    };
  }

  generateMixed(): MathProblem {
    const r = Math.random();
    if (r < 0.33) return this.generateAddition();
    if (r < 0.66) return this.generateSubtraction();
    return this.generateDivision(); // Random 2-9 for mixed mode
  }
}