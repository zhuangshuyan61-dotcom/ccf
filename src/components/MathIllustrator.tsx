/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Eye, EyeOff } from 'lucide-react';

interface MathIllustratorProps {
  num1: number;
  num2: number;
  operator: '×' | '÷';
  emoji: string;
}

export const MathIllustrator: React.FC<MathIllustratorProps> = ({
  num1,
  num2,
  operator,
  emoji
}) => {
  const [showCounter, setShowCounter] = useState(false);

  const isMultiplication = operator === '×';
  const totalItems = isMultiplication ? num1 * num2 : num1;
  const groupCount = isMultiplication ? num1 : num2; 
  const itemsPerGroup = isMultiplication ? num2 : (num2 > 0 ? num1 / num2 : 0);

  // If the total items are too many (e.g. 5x10, 10x10), we don't draw individual items
  // to prevent clutter on mobile/tablet frames. Max items = 45.
  const canIllustrate = totalItems <= 45 && groupCount <= 10 && itemsPerGroup <= 10;

  if (!canIllustrate) {
    return (
      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center mt-3 max-w-md mx-auto">
        <p className="text-amber-800 text-sm font-medium">
          🌟 这个算式的数量很多哦！试着和小兔子一起背诵乘法口诀吧！
        </p>
        <p className="text-xs text-amber-600/80 mt-1">
          提示：{isMultiplication ? `${num1} 个 ${num2} 相加` : `把 ${num1} 按 ${num2} 等分`}
        </p>
      </div>
    );
  }

  // Generate groups structure
  const groupsArray = Array.from({ length: groupCount });
  const itemsArray = Array.from({ length: itemsPerGroup });

  return (
    <div id="math-illustrator" className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-sky-100 rounded-3xl p-4 sm:p-5 my-4 shadow-sm relative overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-sky-50 pb-2">
        <div className="flex items-center gap-1.5 text-sky-700">
          <HelpCircle className="w-5 h-5 text-sky-500 animate-bounce" />
          <span className="font-bold text-sm sm:text-base">
            {isMultiplication ? '乘法小推理解密 ⭐' : '除法平分小游戏 🍒'}
          </span>
        </div>
        
        <button
          id="btn-toggle-counter"
          onClick={() => setShowCounter(!showCounter)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${
            showCounter 
              ? 'bg-sky-500 text-white shadow-sm' 
              : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
          }`}
        >
          {showCounter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showCounter ? '隐藏数字提示' : '显示数字提示'}
        </button>
      </div>

      <div className="text-center text-xs sm:text-sm text-slate-600 mb-4 bg-slate-50/70 p-2 rounded-xl">
        {isMultiplication ? (
          <p>
            有 <strong className="text-pink-600 text-base">{num1}</strong> 个盘子，
            每个盘子里有 <strong className="text-pink-600 text-base">{num2}</strong> 个 {emoji}。求一共有多少个？
          </p>
        ) : (
          <p>
            一共有 <strong className="text-sky-600 text-base">{num1}</strong> 个 {emoji}，
            平均分到 <strong className="text-sky-600 text-base">{num2}</strong> 个篮子里。每个篮子分几个？
          </p>
        )}
      </div>

      {/* Visual Workspace Grid */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2 min-h-[110px]">
        {groupsArray.map((_, groupIdx) => {
          let globalItemOffset = groupIdx * itemsPerGroup;
          return (
            <motion.div
              key={groupIdx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: groupIdx * 0.05 }}
              className="relative bg-amber-50/40 border-2 border-amber-200/60 rounded-2xl p-2.5 min-w-[75px] min-h-[75px] flex flex-wrap items-center justify-center gap-1 shadow-sm max-w-[120px]"
            >
              <div className="absolute -top-2 -left-2 bg-amber-200 text-amber-900 border border-amber-300 font-mono font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {groupIdx + 1}
              </div>

              {itemsArray.map((_, itemIdx) => {
                const countNum = globalItemOffset + itemIdx + 1;
                return (
                  <div key={itemIdx} className="relative group p-0.5 select-none">
                    <span className="text-2xl filter drop-shadow-sm transition-transform duration-200 hover:scale-125 block">
                      {emoji}
                    </span>
                    <AnimatePresence>
                      {showCounter && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -bottom-1.5 -right-1 bg-red-400 text-white font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs pointer-events-none"
                        >
                          {countNum}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-xs text-sky-600/80 mt-2">
        💡 只要数一数上面的礼物，就能得到正确答案哦！
      </div>
    </div>
  );
};
