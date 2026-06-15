/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MathQuestion, QuizSettings } from './types';

export const CHUTE_EMOJIS = [
  '🍎', '🍓', '🍊', '🍉', '🍕', '🍪', '🍨', '🍒', '🍇', '🍌',
  '🐹', '🐼', '🦊', '🦁', '🐸', '🐨', '🐣', '🐰', '🐯', '🚗',
  '🎈', '⭐', '🎁', '⚽', '🎨', '🚀', '🦖', '🐝', '🧁', '🍩'
];

export const CONGRATS_PHRASES = [
  '太棒啦！你真聪明！',
  '答对啦！你是数学小天才！',
  '真厉害，给你一朵小红花！ 🌸',
  '哇，算得又快又准！',
  '你就像一颗闪亮的小星星！ ⭐',
  '手速拉满，超级棒！',
  '太棒了！小松鼠为你鼓掌！ 🐿️'
];

export const ENCOURAGEMENT_PHRASES = [
  '没关系，再想一想哦~',
  '差一点点就对啦，再算算！',
  '加油，你是最棒的，多试一次！',
  '哎呀，被小怪兽捉弄了，再来！',
  '大熊猫在为你加油，再试试吧！ 🐼',
  '不要着急，慢慢算，你一定行！'
];

// Helper to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate unique options for a question
function generateOptions(num1: number, num2: number, operator: '×' | '÷', correct: number): number[] {
  const optionsSet = new Set<number>();
  optionsSet.add(correct);

  // Add common kid errors as distraction options
  if (operator === '×') {
    // Error 1: Add instead of multiply (e.g., 3 * 4 -> 7)
    const additionVal = num1 + num2;
    if (additionVal !== correct && additionVal > 0) optionsSet.add(additionVal);

    // Error 2: Off-by-one in multiplier (e.g., 3 * 4 -> 3 * 3 = 9)
    const offByOneMultiplier = num1 * Math.max(1, num2 - 1);
    if (offByOneMultiplier !== correct && offByOneMultiplier > 0) optionsSet.add(offByOneMultiplier);

    const offByOnePlus = num1 * (num2 + 1);
    if (offByOnePlus !== correct && offByOnePlus > 0) optionsSet.add(offByOnePlus);

    // Error 3: Standard typo / off-by-one overall
    const plusOne = correct + 1;
    optionsSet.add(plusOne);
    const minusOne = correct - 1;
    if (minusOne > 0) optionsSet.add(minusOne);
  } else {
    // Division: A / B = C
    // Error 1: Subtraction instead of division (e.g., 6 / 2 -> 4)
    const subtractionVal = num1 - num2;
    if (subtractionVal !== correct && subtractionVal > 0) optionsSet.add(subtractionVal);

    // Error 2: Multiplication instead of division (e.g., 6 / 2 -> 12, common slip)
    const multiplyVal = num1 * num2;
    if (multiplyVal !== correct && multiplyVal < 100) optionsSet.add(multiplyVal);

    // Error 3: Off-by-one
    const plusOne = correct + 1;
    optionsSet.add(plusOne);
    const minusOne = correct - 1;
    if (minusOne > 0) optionsSet.add(minusOne);
  }

  // Generate random digits if we still need more options to fill to 4
  let attempts = 0;
  while (optionsSet.size < 4 && attempts < 50) {
    attempts++;
    let rand = 0;
    if (operator === '×') {
      const maxRange = Math.max(10, correct * 1.5);
      rand = Math.floor(Math.random() * maxRange) + 1;
    } else {
      rand = Math.floor(Math.random() * 9) + 1;
    }
    if (rand !== correct && rand > 0) {
      optionsSet.add(rand);
    }
  }

  // Ensure options set matches 4 options
  while (optionsSet.size < 4) {
    const fallback = correct + optionsSet.size + 1;
    optionsSet.add(fallback);
  }

  return shuffleArray(Array.from(optionsSet));
}

// Generate single question based on configuration
function generateSingleQuestion(settings: QuizSettings, usedKeys: Set<string>): MathQuestion {
  const { operation, level } = settings;
  
  // Decide actual operators allowed
  let currentOp: '×' | '÷' = '×';
  if (operation === 'multiply') {
    currentOp = '×';
  } else if (operation === 'divide') {
    currentOp = '÷';
  } else {
    currentOp = Math.random() > 0.5 ? '×' : '÷';
  }

  let num1 = 1;
  let num2 = 1;
  let answer = 1;

  // Let's configure ranges based on level
  if (currentOp === '×') {
    if (level === 'beginner') {
      // 1 to 5 multiplication. Outcome max 25. Extremely easy to count!
      num1 = Math.floor(Math.random() * 5) + 1; // 1-5
      num2 = Math.floor(Math.random() * 5) + 1; // 1-5
    } else if (level === 'standard') {
      // Friendly multipliers: 1, 2, 3, 5, 10
      const friendlyMultipliers = [1, 2, 3, 5, 10];
      num1 = friendlyMultipliers[Math.floor(Math.random() * friendlyMultipliers.length)];
      num2 = Math.floor(Math.random() * 9) + 1; // 1-9
      // Randomize position of multiplier
      if (Math.random() > 0.5) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
    } else if (level === 'expert') {
      // Full 1st-9th grade level table (1-9)
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * 9) + 1;
    } else {
      // Custom mode: maxMultiplier defaults to 9 or configured
      const max = settings.maxMultiplier || 9;
      num1 = Math.floor(Math.random() * max) + 1;
      num2 = Math.floor(Math.random() * max) + 1;
    }
    answer = num1 * num2;
  } else {
    // Division: we want C = A / B
    // We generate B (divisor) and C (answer) first, then A = B * C
    let divisor = 1;
    let quotient = 1;

    if (level === 'beginner') {
      // Math.max 5 answers
      divisor = Math.floor(Math.random() * 5) + 1; // 1-5
      quotient = Math.floor(Math.random() * 5) + 1; // 1-5
    } else if (level === 'standard') {
      // Friendly divisor: 1, 2, 3, 5, 10
      const friendlyDivisors = [1, 2, 3, 5, 10];
      divisor = friendlyDivisors[Math.floor(Math.random() * friendlyDivisors.length)];
      quotient = Math.floor(Math.random() * 8) + 1; // 1-8 answer
    } else if (level === 'expert') {
      // Fully 1-9 table division
      divisor = Math.floor(Math.random() * 9) + 1;
      quotient = Math.floor(Math.random() * 9) + 1;
    } else {
      const max = settings.maxMultiplier || 9;
      divisor = Math.floor(Math.random() * max) + 1;
      quotient = Math.floor(Math.random() * max) + 1;
    }

    num1 = divisor * quotient; // Dividend
    num2 = divisor; // Divisor
    answer = quotient; // Answer
  }

  const key = `${num1}${currentOp}${num2}`;
  return {
    id: Math.random().toString(36).substring(2, 9),
    num1,
    num2,
    operator: currentOp,
    correctAnswer: answer,
    options: generateOptions(num1, num2, currentOp, answer),
    visualEmoji: CHUTE_EMOJIS[Math.floor(Math.random() * CHUTE_EMOJIS.length)]
  };
}

// Full generator with duplicates prevention
export function generateQuiz(settings: QuizSettings): MathQuestion[] {
  const quiz: MathQuestion[] = [];
  const usedKeys = new Set<string>();
  const totalWanted = settings.questionCount;

  // Let's generate questions
  let attempts = 0;
  while (quiz.length < totalWanted && attempts < totalWanted * 10) {
    attempts++;
    const q = generateSingleQuestion(settings, usedKeys);
    const key = `${q.num1}${q.operator}${q.num2}`;
    
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      quiz.push(q);
    }
  }

  // If we couldn't find enough unique, release constraint and fill up
  while (quiz.length < totalWanted) {
    const q = generateSingleQuestion(settings, usedKeys);
    quiz.push({
      ...q,
      id: Math.random().toString(36).substring(2, 9) // unique id
    });
  }

  return quiz;
}
