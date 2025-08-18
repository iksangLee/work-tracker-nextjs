'use client';

import { memo } from 'react';
import { Coffee, Info } from 'lucide-react';
import BlurCard from './BlurCard';

interface BreakTimeInfoProps {
  totalHours: number;
  workHours: number;
  className?: string;
}

const BreakTimeInfo = memo(function BreakTimeInfo({ totalHours, workHours, className = '' }: BreakTimeInfoProps) {
  const breakHours = totalHours - workHours;
  
  // 휴게시간이 없으면 표시하지 않음
  if (breakHours <= 0) return null;

  const getBreakMessage = () => {
    if (breakHours >= 1) {
      return "법정 휴게시간 1시간이 차감되었습니다";
    } else {
      return "법정 휴게시간 30분이 차감되었습니다";
    }
  };

  const formatBreakTime = () => {
    if (breakHours >= 1) {
      return "1시간";
    } else {
      return "30분";
    }
  };

  return (
    <BlurCard intensity="light" className={`p-3 bg-amber-500/10 border-amber-500/30 ${className}`}>
      <div className="flex items-center gap-2">
        <Coffee size={14} color="#F59E0B" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-medium text-xs">
              휴게시간 차감
            </span>
            <span className="text-amber-400 font-bold text-xs">
              -{formatBreakTime()}
            </span>
          </div>
          <p className="text-white/70 text-xs mt-1 leading-tight">
            {getBreakMessage()}
          </p>
        </div>
        <Info size={12} color="#F59E0B" className="opacity-60" />
      </div>
    </BlurCard>
  );
});

export default BreakTimeInfo;