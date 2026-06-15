/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MathQuestion, UserAnswer, QuizSettings } from '../types';
import { MathIllustrator } from './MathIllustrator';
import { CONGRATS_PHRASES, ENCOURAGEMENT_PHRASES } from '../data';
import { sounds } from '../utils/audio';
import { Sparkles, ArrowRight, CornerDownLeft, Delete, Volume2, HelpCircle } from 'lucide-react';

interface QuizScreenProps {
  questions: MathQuestion[];
  settings: QuizSettings;
  onFinishQuiz: (answers: UserAnswer[]) => void;
  onExit: () => void;
}

// Map digits to Chinese pronunciation and mnemonic tables
const CHINESE_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

function toChineseNum(num: number): string {
  if (num <= 10) return CHINESE_DIGITS[num];
  if (num < 20) return `十${CHINESE_DIGITS[num % 10]}`;
  const tens = Math.floor(num / 10);
  const units = num % 10;
  return `${CHINESE_DIGITS[tens]}十${units > 0 ? CHINESE_DIGITS[units] : ''}`;
}

// Standard Chinese mathematical recitation formula loader
function getFormulaSpeakMnemonic(num1: number, num2: number, op: '×' | '÷', correctAns: number): string {
  if (op === '×') {
    // Chinese multiplication mnemonic tables (e.g. 3 * 4 = 12 -> "三四一十二")
    if (num1 <= 9 && num2 <= 9) {
      const smaller = Math.min(num1, num2);
      const larger = Math.max(num1, num2);
      const smallCN = CHINESE_DIGITS[smaller];
      const largeCN = CHINESE_DIGITS[larger];
      const ans = smaller * larger;
      
      if (ans < 10) {
        return `${smallCN}${largeCN}得${CHINESE_DIGITS[ans]}`;
      } else {
        // e.g. 12 -> 十二 or 一十二, 20 -> 二十, 24 -> 二十四
        const tens = Math.floor(ans / 10);
        const units = ans % 10;
        let ansStr = '';
        if (tens === 1) {
          ansStr = `一十${units > 0 ? CHINESE_DIGITS[units] : ''}`;
        } else {
          ansStr = `${CHINESE_DIGITS[tens]}十${units > 0 ? CHINESE_DIGITS[units] : ''}`;
        }
        return `${smallCN}${largeCN}${ansStr}`;
      }
    }
    return `${toChineseNum(num1)} 乘以 ${toChineseNum(num2)} 等于 ${toChineseNum(correctAns)}`;
  } else {
    // Division
    return `${toChineseNum(num1)} 除以 ${toChineseNum(num2)} 等于 ${toChineseNum(correctAns)}`;
  }
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  settings,
  onFinishQuiz,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [inputMode, setInputMode] = useState<'choice' | 'keypad'>('choice');
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [stars, setStars] = useState(0);
  
  // Question tracking
  const currentQuestion = questions[currentIndex];
  const startTimeRef = useRef<number>(Date.now());

  // Feedback states
  const [answeredState, setAnsweredState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [feedbackPhrase, setFeedbackPhrase] = useState('');

  // Voice speech on first load + on subsequent question load
  useEffect(() => {
    if (!currentQuestion) return;
    
    // Reset inputs and timers
    setTypedAnswer('');
    setAnsweredState('unanswered');
    setSelectedNum(null);
    startTimeRef.current = Date.now();

    // Prepare voice readout of formula
    const operatorStr = currentQuestion.operator === '×' ? '乘以' : '除以';
    const textToSpeak = `${currentQuestion.num1} ${operatorStr} ${currentQuestion.num2} 等于几呢？`;
    
    // Delayed play to wait for screen transit
    const t = setTimeout(() => {
      sounds.speak(textToSpeak);
    }, 450);

    return () => clearTimeout(t);
  }, [currentIndex, currentQuestion]);

  const handleAnswerSubmit = (submittedVal: number) => {
    if (answeredState !== 'unanswered') return;

    const timeSpentMs = Date.now() - startTimeRef.current;
    const isCorrect = submittedVal === currentQuestion.correctAnswer;

    setSelectedNum(submittedVal);
    
    if (isCorrect) {
      setAnsweredState('correct');
      setStars((prev) => prev + 1);
      sounds.playSuccess();
      
      // Compute correct phrase + spoken mnemonic mnemonic
      const phrase = CONGRATS_PHRASES[Math.floor(Math.random() * CONGRATS_PHRASES.length)];
      setFeedbackPhrase(phrase);

      const mnemonic = getFormulaSpeakMnemonic(
        currentQuestion.num1,
        currentQuestion.num2,
        currentQuestion.operator,
        currentQuestion.correctAnswer
      );
      sounds.speak(`答对啦！${mnemonic}`);
    } else {
      setAnsweredState('incorrect');
      sounds.playFail();

      const phrase = ENCOURAGEMENT_PHRASES[Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)];
      setFeedbackPhrase(phrase);

      sounds.speak(`哎呀，算错啦。正确答案是 ${currentQuestion.correctAnswer}`);
    }

    const currentAnswerObj: UserAnswer = {
      question: currentQuestion,
      userAnswer: submittedVal,
      isCorrect,
      timeSpentMs
    };

    setAnswers((prev) => [...prev, currentAnswerObj]);
  };

  const handleNext = () => {
    sounds.playPop();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Complete!
      onFinishQuiz(answers);
    }
  };

  // Keyboard Numpad typing helpers
  const handleKeyTap = (key: string) => {
    if (answeredState !== 'unanswered') return;
    sounds.playTick();

    if (key === 'clear') {
      setTypedAnswer('');
    } else if (key === 'back') {
      setTypedAnswer((prev) => prev.slice(0, -1));
    } else {
      // Max 3 digits
      if (typedAnswer.length < 3) {
        setTypedAnswer((prev) => prev + key);
      }
    }
  };

  const handleConfirmKeypad = () => {
    if (typedAnswer === '') return;
    const ans = parseInt(typedAnswer, 10);
    handleAnswerSubmit(ans);
  };

  const handleSpeakQuestion = () => {
    const opStr = currentQuestion.operator === '×' ? '乘以' : '除以';
    sounds.speak(`${currentQuestion.num1} ${opStr} ${currentQuestion.num2} 等于几？`);
  };

  const percentComplete = Math.floor((currentIndex / questions.length) * 100);

  return (
    <div id="quiz-screen" className="max-w-xl mx-auto space-y-4">
      {/* Quiz Screen Header */}
      <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-sky-100 flex items-center justify-between">
        <button
          id="btn-quit-quiz"
          onClick={onExit}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
        >
          返回大厅
        </button>

        {/* Level and Score badges */}
        <div className="flex gap-2.5 items-center">
          <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
            ⭐ {stars} 颗星
          </span>
          <span className="bg-sky-100 text-sky-800 font-extrabold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider select-none">
            第 {currentIndex + 1} / {questions.length} 题
          </span>
        </div>
      </div>

      {/* Progress Candies Bar */}
      <div className="bg-white/80 rounded-full h-3 border border-slate-100 p-0.5 overflow-hidden shadow-xs relative">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentComplete}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Primary Math Question Card */}
      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-100 relative overflow-hidden text-center">
        {/* Adorable character bubble */}
        <div className="flex justify-center mb-1">
          <div className="relative">
            <span className="text-4xl filter drop-shadow-sm select-none">🐨</span>
            <div className="absolute -top-1 -right-2 bg-red-400 text-white rounded-full p-1 border border-white cursor-pointer hover:bg-red-500" onClick={handleSpeakQuestion} title="读题">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Big digits displaying core math problem */}
        <div id="math-formula-box" className="py-6 flex items-center justify-center gap-4 text-slate-800 font-sans tracking-tight">
          <span className="text-5xl sm:text-6xl font-black text-slate-850 select-none">
            {currentQuestion.num1}
          </span>
          <span className="text-4xl sm:text-5xl font-black text-rose-500 select-none">
            {currentQuestion.operator}
          </span>
          <span className="text-5xl sm:text-6xl font-black text-slate-850 select-none">
            {currentQuestion.num2}
          </span>
          <span className="text-4xl sm:text-5xl font-black text-slate-500 select-none">
            =
          </span>
          
          <AnimatePresence mode="wait">
            {answeredState !== 'unanswered' ? (
              <motion.span
                key="show-ans"
                initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className={`text-5xl sm:text-6xl font-black font-mono border-b-6 pb-1 min-w-[80px] inline-block ${
                  answeredState === 'correct' ? 'text-teal-500 border-teal-300' : 'text-rose-500 border-rose-300'
                }`}
              >
                {currentQuestion.correctAnswer}
              </motion.span>
            ) : (
              <motion.span
                key="hidden-ans"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="text-4xl sm:text-5xl font-extrabold text-sky-400 bg-sky-50 border-4 border-dashed border-sky-200 rounded-2xl w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center shadow-inner font-mono"
              >
                {typedAnswer || '?'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Visual Aids Option */}
        {settings.showVisualAid && (
          <MathIllustrator
            num1={currentQuestion.num1}
            num2={currentQuestion.num2}
            operator={currentQuestion.operator}
            emoji={currentQuestion.visualEmoji}
          />
        )}

        {/* Interactive Answer Box */}
        {answeredState === 'unanswered' ? (
          <div>
            {/* Input Selection Header */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                id="tab-choice"
                onClick={() => { sounds.playPop(); setInputMode('choice'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  inputMode === 'choice'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                🍭 糖果多选
              </button>
              <button
                id="tab-keypad"
                onClick={() => { sounds.playPop(); setInputMode('keypad'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  inputMode === 'keypad'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                ⌨️ 水果键盘
              </button>
            </div>

            {/* Render input depending on mode */}
            <AnimatePresence mode="wait">
              {inputMode === 'choice' ? (
                <motion.div
                  key="choice-grid"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-2 gap-3.5 max-w-sm mx-auto"
                >
                  {currentQuestion.options.map((option) => (
                    <button
                      id={`btn-option-${option}`}
                      key={option}
                      onClick={() => handleAnswerSubmit(option)}
                      className="bg-sky-50/50 hover:bg-sky-100/75 border-2 border-sky-100 hover:border-sky-300 text-sky-950 font-black text-2xl py-3.5 px-4 rounded-2xl cursor-pointer select-none shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:scale-95"
                    >
                      {option}
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="keypad-grid"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-[280px] mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-inner"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        id={`key-${digit}`}
                        key={digit}
                        onClick={() => handleKeyTap(digit)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 active:bg-slate-200 text-slate-800 font-extrabold text-xl py-2.5 rounded-xl transition-all cursor-pointer select-none"
                      >
                        {digit}
                      </button>
                    ))}
                    
                    {/* Clear Button */}
                    <button
                      id="key-clear"
                      onClick={() => handleKeyTap('clear')}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold py-2.5 rounded-xl cursor-pointer select-none"
                    >
                      清除
                    </button>

                    <button
                      id="key-0"
                      onClick={() => handleKeyTap('0')}
                      className="bg-white hover:bg-slate-100 border border-slate-200 active:bg-slate-200 text-slate-800 font-extrabold text-xl py-2.5 rounded-xl cursor-pointer select-none"
                    >
                      0
                    </button>

                    {/* Backspace Button */}
                    <button
                      id="key-back"
                      onClick={() => handleKeyTap('back')}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center rounded-xl cursor-pointer select-none"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    id="btn-confirm-keypad"
                    disabled={typedAnswer === ''}
                    onClick={handleConfirmKeypad}
                    className={`w-full mt-2 text-white font-extrabold text-sm py-2.5 rounded-xl border-b-2 shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer select-none ${
                      typedAnswer === ''
                        ? 'bg-slate-300 border-slate-450 cursor-not-allowed shadow-none'
                        : 'bg-emerald-500 border-emerald-700 hover:brightness-105 active:scale-98'
                    }`}
                  >
                    <CornerDownLeft className="w-4 h-4" />
                    确定答案
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Celeb and Mistake Correction Feedback screen block */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-2xl p-5 text-center shadow-md border max-w-sm mx-auto ${
              answeredState === 'correct'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="text-3xl mb-1.5">
              {answeredState === 'correct' ? '🎉' : '💡'}
            </div>

            <div className="font-extrabold text-lg leading-snug">
              {feedbackPhrase}
            </div>

            {answeredState === 'incorrect' && (
              <div className="text-xs text-rose-600 mt-2 bg-white/70 p-2.5 rounded-lg border border-rose-100 inline-block text-left">
                <strong>错题本提示：</strong>
                <p className="mt-1 font-medium">
                  {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} 的正确得数是{' '}
                  <span className="font-bold text-base text-rose-700 underline underline-offset-2">{currentQuestion.correctAnswer}</span>。
                  别气馁，我们多加练习！⭐
                </p>
              </div>
            )}

            {answeredState === 'correct' && (
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-600">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>恭喜通关！奖励 +1 颗小红星</span>
              </div>
            )}

            <button
              id="btn-next-question"
              onClick={handleNext}
              className={`w-full mt-4 text-white font-extrabold py-3.5 rounded-xl border-b-3 shadow-md flex items-center justify-center gap-1 cursor-pointer select-none transition-transform duration-100 hover:brightness-105 active:translate-y-0.5 ${
                answeredState === 'correct'
                  ? 'bg-emerald-500 border-emerald-700'
                  : 'bg-rose-500 border-rose-700'
              }`}
            >
              <span>{currentIndex + 1 < questions.length ? '下一关口算 🚀' : '查看冒险成果 🏆'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
