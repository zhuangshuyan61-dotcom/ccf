/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QuizSettings, OperationType, LevelType } from '../types';
import { Sparkles, Trophy, Settings, Volume2, VolumeX, Eye, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface WelcomeScreenProps {
  onStartQuiz: (settings: QuizSettings) => void;
  savedHighScores: { [key: string]: number };
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartQuiz,
  savedHighScores
}) => {
  const [operation, setOperation] = useState<OperationType>('mixed');
  const [level, setLevel] = useState<LevelType>('beginner');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showVisualAid, setShowVisualAid] = useState<boolean>(true);
  const [maxMultiplier, setMaxMultiplier] = useState<number>(9);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  const handleStart = () => {
    sounds.playSuccess();
    onStartQuiz({
      operation,
      level,
      questionCount,
      showVisualAid,
      maxMultiplier: level === 'custom' ? maxMultiplier : undefined
    });
  };

  const toggleVoice = () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    sounds.setVoiceEnabled(nextVal);
    if (nextVal) {
      sounds.speak('语音伴读已开启');
    }
  };

  return (
    <div id="welcome-screen" className="max-w-xl mx-auto bg-white/90 rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-100">
      {/* Cartoon Header */}
      <div className="text-center mb-8 relative pt-4">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="inline-block text-6xl mb-4 filter drop-shadow-md select-none"
        >
          🐰🥕
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center gap-2">
          乘除法口算萌萌练
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          专为一年级和小朋友设计的趣味数学闯关 🌈
        </p>
      </div>

      {/* Quick Stats Panel */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="bg-sky-100 p-2 rounded-xl text-sky-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">最高得分</div>
            <div className="text-sm font-black text-slate-700">
              {savedHighScores.highestScore || 0}分
            </div>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">冲关次数</div>
            <div className="text-sm font-black text-slate-700">
              {savedHighScores.totalAttempts || 0}次
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* 1. Operation Selection */}
        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
            <BookOpen className="w-4 h-4 text-sky-500" />
            第一步：选择计算方法
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'multiply', label: '乘法练习', sign: '×', color: 'border-pink-200 hover:bg-pink-50 text-pink-700 bg-pink-50/20', activeColor: 'bg-gradient-to-r from-pink-400 to-pink-500 text-white border-pink-500' },
              { id: 'divide', label: '除法练习', sign: '÷', color: 'border-blue-200 hover:bg-blue-50 text-blue-700 bg-blue-50/20', activeColor: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-500' },
              { id: 'mixed', label: '乘除混合', sign: '×÷', color: 'border-purple-200 hover:bg-purple-50 text-purple-700 bg-purple-50/20', activeColor: 'bg-gradient-to-r from-purple-400 to-purple-500 text-white border-purple-500' }
            ].map((op) => {
              const selected = operation === op.id;
              return (
                <button
                  id={`op-${op.id}`}
                  key={op.id}
                  onClick={() => {
                    sounds.playPop();
                    setOperation(op.id as OperationType);
                  }}
                  className={`border-2 rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer select-none flex flex-col items-center justify-center gap-1 ${
                    selected ? op.activeColor + ' shadow-md scale-[1.02]' : op.color
                  }`}
                >
                  <span className="text-2xl font-black">{op.sign}</span>
                  <span className="text-xs font-bold">{op.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Difficulty Level */}
        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
            <Trophy className="w-4 h-4 text-emerald-500" />
            第二步：选择难度
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'beginner', title: '🌱 萌芽新手', desc: '1至5的小乘除法，最易数数' },
              { id: 'standard', title: '⭐ 渐入佳境', desc: '口算2、5、10整倍数练习' },
              { id: 'expert', title: '🏆 能手冲刺', desc: '完整的 1-9 九九乘法表' },
              { id: 'custom', title: '⚙️ 自定义', desc: '自由设定算术最大数字' }
            ].map((lvl) => {
              const selected = level === lvl.id;
              return (
                <button
                  id={`lvl-${lvl.id}`}
                  key={lvl.id}
                  onClick={() => {
                    sounds.playPop();
                    setLevel(lvl.id as LevelType);
                  }}
                  className={`border-2 rounded-2xl p-3 text-left transition-all duration-200 cursor-pointer select-none ${
                    selected
                      ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/40 text-slate-600'
                  }`}
                >
                  <div className="font-extrabold text-sm">{lvl.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">{lvl.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Conditional Custom level inputs */}
          {level === 'custom' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 bg-amber-50/30 border border-amber-100 rounded-xl p-3"
            >
              <div className="flex items-center justify-between text-xs text-amber-800">
                <span className="font-bold">设定最大口算乘数：</span>
                <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded-lg shadow-xs border border-amber-200">
                  {maxMultiplier}
                </span>
              </div>
              <input
                id="input-max-multiplier"
                type="range"
                min="2"
                max="12"
                value={maxMultiplier}
                onChange={(e) => {
                  sounds.playTick();
                  setMaxMultiplier(parseInt(e.target.value));
                }}
                className="w-full accent-amber-500 mt-2 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-1">
                <span>小班 (2)</span>
                <span>中班 (5)</span>
                <span>大班/九九 (9)</span>
                <span>进阶 (12)</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 3. Question Count Selection */}
        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <Settings className="w-4 h-4 text-pink-500" />
            第三步：选择大关卡题数
          </label>
          <div className="flex gap-2">
            {[10, 20, 30].map((count) => {
              const selected = questionCount === count;
              return (
                <button
                  id={`count-${count}`}
                  key={count}
                  onClick={() => {
                    sounds.playPop();
                    setQuestionCount(count);
                  }}
                  className={`flex-1 border-2 rounded-xl py-2 font-bold text-sm select-none cursor-pointer transition-all ${
                    selected
                      ? 'border-slate-700 bg-slate-800 text-white'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-600'
                  }`}
                >
                  {count} 题
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Aids Toggle and Voice switches */}
        <div className="space-y-3 pt-2">
          {/* Visual Aid */}
          <div className="flex items-center justify-between bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <div>
                <div className="text-xs font-bold text-slate-700">视觉辅助水果盘</div>
                <div className="text-[10px] text-slate-400">画出苹果和盘子，帮助数数解密</div>
              </div>
            </div>
            <button
              id="switch-visual"
              onClick={() => {
                sounds.playPop();
                setShowVisualAid(!showVisualAid);
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                showVisualAid ? 'bg-indigo-500' : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  showVisualAid ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Reading */}
          <div className="flex items-center justify-between bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-700">萌萌伴读语音</div>
                <div className="text-[10px] text-slate-400">用温柔好听的声音读出算式题</div>
              </div>
            </div>
            <button
              id="switch-voice"
              onClick={toggleVoice}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                voiceEnabled ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  voiceEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Large Play Button */}
        <motion.button
          id="btn-start-game"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full mt-4 bg-gradient-to-r from-orange-400 via-amber-500 to-amber-600 text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg border-b-4 border-amber-700/60 transition-all hover:brightness-105 flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          🚀 开启数学大冒险！
        </motion.button>
      </div>
    </div>
  );
};
