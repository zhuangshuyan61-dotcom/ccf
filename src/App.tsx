/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { QuizSettings, MathQuestion, UserAnswer } from './types';
import { generateQuiz } from './data';
import { sounds } from './utils/audio';

export default function App() {
  const [viewState, setViewState] = useState<'welcome' | 'quiz' | 'results'>('welcome');
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  
  // High scores and total attempts persistence
  const [savedStats, setSavedStats] = useState<{ highestScore: number; totalAttempts: number }>({
    highestScore: 0,
    totalAttempts: 0
  });

  // Load stats on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kids_mental_math_stats');
      if (stored) {
        setSavedStats(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  const handleStartQuiz = (newSettings: QuizSettings) => {
    setSettings(newSettings);
    
    // Generate questions
    const generated = generateQuiz(newSettings);
    setQuestions(generated);
    setAnswers([]);
    setViewState('quiz');
  };

  const handleFinishQuiz = (finalAnswers: UserAnswer[]) => {
    setAnswers(finalAnswers);
    
    // Save/update global statistics
    const correctCount = finalAnswers.filter((a) => a.isCorrect).length;
    const scoreVal = finalAnswers.length > 0 ? Math.round((correctCount / finalAnswers.length) * 100) : 0;
    
    const updatedStats = {
      highestScore: Math.max(savedStats.highestScore, scoreVal),
      totalAttempts: savedStats.totalAttempts + 1
    };

    setSavedStats(updatedStats);
    
    try {
      localStorage.setItem('kids_mental_math_stats', JSON.stringify(updatedStats));
    } catch (e) {
      console.warn('Could not write to localStorage', e);
    }
    
    setViewState('results');
  };

  const handleRestartQuiz = () => {
    if (settings) {
      handleStartQuiz(settings);
    } else {
      setViewState('welcome');
    }
  };

  const handleRedoIncorrectOnly = () => {
    if (!settings) return;

    // Filter incorrect user answers
    const incorrectQs = answers
      .filter((ans) => !ans.isCorrect)
      .map((ans) => ans.question);

    if (incorrectQs.length > 0) {
      setQuestions(incorrectQs);
      setAnswers([]);
      setViewState('quiz');
      sounds.playSuccess();
    }
  };

  const handleBackToMenu = () => {
    setViewState('welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-indigo-50 to-pink-100 pb-16 pt-8 px-4 font-sans select-none relative overflow-x-hidden antialiased">
      {/* Background Decorative Sparkles (Child friendly, elegant CSS shapes) */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-rose-200/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 right-5 w-32 h-32 bg-sky-200/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-yellow-250/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Game Area */}
      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {viewState === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <WelcomeScreen
                onStartQuiz={handleStartQuiz}
                savedHighScores={savedStats}
              />
            </motion.div>
          )}

          {viewState === 'quiz' && questions.length > 0 && settings && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
            >
              <QuizScreen
                questions={questions}
                settings={settings}
                onFinishQuiz={handleFinishQuiz}
                onExit={handleBackToMenu}
              />
            </motion.div>
          )}

          {viewState === 'results' && settings && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <ResultsScreen
                answers={answers}
                settings={settings}
                onRestart={handleRestartQuiz}
                onRedoIncorrectOnly={handleRedoIncorrectOnly}
                onBackToMenu={handleBackToMenu}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Humble Footer with visual credit */}
      <div className="text-center text-[10px] text-slate-400 mt-12 pb-4">
        🐥 口算宝贝冒险岛 · 快乐学习，天天向上
      </div>
    </div>
  );
}
