/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OperationType = 'multiply' | 'divide' | 'mixed';

export type LevelType = 'beginner' | 'standard' | 'expert' | 'custom';

export interface QuizSettings {
  operation: OperationType;
  level: LevelType;
  questionCount: number;
  showVisualAid: boolean;
  maxMultiplier?: number; // For custom
}

export interface MathQuestion {
  id: string;
  num1: number;
  num2: number;
  operator: '×' | '÷';
  correctAnswer: number;
  options: number[]; // 4 multiple choice options
  visualEmoji: string; // Emoji representing the objects, like 🍎 or 🐼
}

export interface UserAnswer {
  question: MathQuestion;
  userAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface HistoryRecord {
  id: string;
  date: string;
  settings: QuizSettings;
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  timeSpentSeconds: number;
}
