/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { UserAnswer, QuizSettings } from '../types';
import { Trophy, RefreshCw, RotateCcw, AlertTriangle, CheckCircle, ThumbsUp, Medal, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ResultsScreenProps {
  answers: UserAnswer[];
  settings: QuizSettings;
  onRestart: () => void;
  onRedoIncorrectOnly: () => void;
  onBackToMenu: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  answers,
  settings,
  onRestart,
  onRedoIncorrectOnly,
  onBackToMenu
}) => {
  const total = answers.length;
  const correctsList = answers.filter((a) => a.isCorrect);
  const correctCount = correctsList.length;
  const incorrectCount = total - correctCount;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Calculate stats
  const totalTimeSpentMs = answers.reduce((acc, current) => acc + current.timeSpentMs, 0);
  const totalSeconds = Math.round(totalTimeSpentMs / 1000);
  const averageSpeedSec = total > 0 ? (totalSeconds / total).toFixed(1) : '0';

  // Cute award labels and star ratings based on primary school scales
  let starsCount = 1;
  let awardTitle = '🌱 萌芽雏鹰';
  let awardSlogan = '太棒了，熟能生巧，多练几次你就是口算明星！';
  let awardColor = 'from-emerald-450 to-teal-500';
  let badgeEmoji = '🥉';

  if (scorePercent === 100) {
    starsCount = 3;
    awardTitle = '🏆 特等奖 · 数学大满贯';
    awardSlogan = '哇！一题都没算错！你是绝对的数学小天才！';
    awardColor = 'from-yellow-400 via-amber-500 to-orange-500 animate-pulse';
    badgeEmoji = '👑';
  } else if (scorePercent >= 80) {
    starsCount = 3;
    awardTitle = '🌟 一等奖 · 口算之星';
    awardSlogan = '超级厉害！反应迅速又准确，为你疯狂鼓掌！';
    awardColor = 'from-amber-400 to-amber-600';
    badgeEmoji = '🥇';
  } else if (scorePercent >= 50) {
    starsCount = 2;
    awardTitle = '✨ 二等奖 · 算术小勇士';
    awardSlogan = '表现得非常好！已经掌握了口算奥秘，再接再厉！';
    awardColor = 'from-sky-400 to-indigo-500';
    badgeEmoji = '🥈';
  }

  // Speak congratulates when results load
  React.useEffect(() => {
    sounds.playSuccess();
    const spokenText = `挑战完成！你的得分是 ${scorePercent}。${scorePercent === 100 ? '哇，全部答对啦，你真是太天才了！' : '表现真棒！继续加油哦！'}`;
    const t = setTimeout(() => {
      sounds.speak(spokenText);
    }, 400);
    return () => clearTimeout(t);
  }, [scorePercent]);

  return (
    <div id="results-screen" className="max-w-xl mx-auto space-y-6">
      {/* 1. Celebratory Card */}
      <div className={`bg-gradient-to-br ${awardColor} text-white rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden`}>
        {/* Floating circles decoration */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-10 translate-y-10" />

        <span className="text-6xl filter drop-shadow-md select-none inline-block mb-3">
          {badgeEmoji}
        </span>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm leading-relaxed">
          {awardTitle}
        </h2>
        <p className="text-xs sm:text-sm text-white/90 max-w-sm mx-auto mt-2 font-medium">
          {awardSlogan}
        </p>

        {/* Stars Display */}
        <div className="flex justify-center gap-3.5 my-5">
          {Array.from({ length: 3 }).map((_, i) => {
            const active = i < starsCount;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: active ? 1 : 0.75, rotate: 0 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className={`text-5xl select-none ${active ? 'filter drop-shadow-md' : 'opacity-30'}`}
              >
                ⭐
              </motion.span>
            );
          })}
        </div>

        {/* Score Ring */}
        <div className="bg-white/15 backdrop-blur-xs rounded-2xl py-3 px-5 inline-grid grid-cols-2 gap-6 border border-white/20">
          <div className="border-r border-white/10 pr-6">
            <div className="text-[10px] text-white/70 font-bold tracking-wider uppercase">通关得分</div>
            <div className="text-3xl font-black font-sans">{scorePercent}%</div>
          </div>
          <div>
            <div className="text-[10px] text-white/70 font-bold tracking-wider uppercase">挑战用时</div>
            <div className="text-3xl font-black font-sans">{totalSeconds}秒</div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-xs">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">答对 / 总数</div>
          <div className="text-lg font-black text-emerald-600 mt-1">
            {correctCount} / {total} 题
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-xs">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">平均答题速度</div>
          <div className="text-lg font-black text-sky-600 mt-1">
            {averageSpeedSec} 秒/题
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-xs">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">错题数</div>
          <div className="text-lg font-black text-rose-500 mt-1">
            {incorrectCount} 题
          </div>
        </div>
      </div>

      {/* 3. Main Action Buttons */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-3">
          {/* Restart Standard */}
          <button
            id="btn-restart-quiz"
            onClick={() => { sounds.playSuccess(); onRestart(); }}
            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black py-4 px-4 rounded-xl shadow-md border-b-3 border-yellow-600 flex items-center justify-center gap-2 cursor-pointer transition-transform duration-100 hover:brightness-105 active:scale-98 text-sm select-none"
          >
            <RefreshCw className="w-4 h-4" />
            再冲一关 🚀
          </button>

          {/* Go Home */}
          <button
            id="btn-back-home"
            onClick={() => { sounds.playPop(); onBackToMenu(); }}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-250 hover:border-slate-300 text-slate-700 font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm select-none"
          >
            <RotateCcw className="w-4 h-4" />
            返回首页 🏠
          </button>
        </div>

        {/* Play Incorrect only - SUPER ADVANTAGE helper */}
        {incorrectCount > 0 && (
          <motion.button
            id="btn-redo-incorrect"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { sounds.playSuccess(); onRedoIncorrectOnly(); }}
            className="w-full bg-gradient-to-r from-red-400 via-rose-500 to-rose-600 text-white font-extrabold text-base py-4 px-6 rounded-xl shadow-lg border-b-4 border-rose-700/75 transition-all hover:brightness-105 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-200 animate-bounce" />
            重点特训：重做这 {incorrectCount} 道错题！ 💪
          </motion.button>
        )}
      </div>

      {/* 4. Solved list grid for review */}
      <div className="bg-white/95 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-150">
        <h3 className="text-sm font-bold text-slate-700 mb-3.5 flex items-center gap-1">
          <Medal className="w-4.5 h-4.5 text-amber-500" />
          答题大本营 · 详情对账单
        </h3>

        <div className="max-h-70 overflow-y-auto divide-y divide-slate-100 pr-1.5 custom-scrollbar">
          {answers.map((ans, idx) => {
            const { question, userAnswer, isCorrect } = ans;
            return (
              <div
                key={question.id || idx}
                className="py-3 flex items-center justify-between gap-2"
              >
                {/* Math item display */}
                <div className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center select-none">{question.visualEmoji}</span>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">
                      {question.num1} {question.operator} {question.num2} = {question.correctAnswer}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      你写的是：<span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-500 font-black'}>{userAnswer}</span>
                      {isCorrect ? ' (算对啦)' : ` (应该写 ${question.correctAnswer})`}
                    </div>
                  </div>
                </div>

                {/* Accuracy Badge */}
                <div>
                  {isCorrect ? (
                    <span className="text-emerald-500 bg-emerald-50 border border-emerald-250 p-1 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4.5 h-4.5" />
                    </span>
                  ) : (
                    <span className="text-rose-500 bg-rose-50 border border-rose-250 p-1 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4.5 h-4.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
