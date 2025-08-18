'use client';

import { memo } from 'react';
import { Clock, Target, TrendingUp, TrendingDown } from 'lucide-react';
import BlurCard from './BlurCard';

interface WeeklyProgressProps {
  currentHours: number;
  targetHours: number;
  progressPercentage: number;
  remainingHours: number;
  isOvertime: boolean;
  overtimeHours: number;
  recommendedDailyHours: number;
  remainingWorkDays: number;
  canTakeEarly: boolean;
}

const WeeklyProgressCard = memo(function WeeklyProgressCard({
  currentHours,
  targetHours,
  progressPercentage,
  remainingHours,
  isOvertime,
  overtimeHours,
  recommendedDailyHours,
  remainingWorkDays,
  canTakeEarly
}: WeeklyProgressProps) {
  
  const getProgressColor = () => {
    if (isOvertime) return '#EF4444'; // 빨간색 (초과)
    if (progressPercentage >= 90) return '#F59E0B'; // 주황색 (거의 달성)
    if (progressPercentage >= 70) return '#10B981'; // 초록색 (양호)
    return '#3B82F6'; // 파란색 (시작 단계)
  };

  const getStatusMessage = () => {
    if (canTakeEarly) {
      return `🎉 목표 달성! ${overtimeHours.toFixed(1)}시간 초과근무`;
    }
    if (remainingWorkDays === 0) {
      return `⏰ 이번 주 ${remainingHours.toFixed(1)}시간 부족`;
    }
    return `📅 ${remainingWorkDays}일 남음, 하루 ${recommendedDailyHours.toFixed(1)}시간씩`;
  };

  const getRecommendationMessage = () => {
    if (canTakeEarly) {
      return "일찍 퇴근하거나 내일 여유롭게 일하세요!";
    }
    if (recommendedDailyHours > 10) {
      return "⚠️ 권장 시간이 너무 높아요. 일정 조정을 고려해보세요.";
    }
    if (recommendedDailyHours < 4 && remainingWorkDays > 0) {
      return "💪 여유로운 일정이네요!";
    }
    return `오늘 ${recommendedDailyHours.toFixed(1)}시간 근무하면 목표 달성 가능해요!`;
  };

  return (
    <BlurCard className="p-4 sm:p-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Target size={20} color="#007AFF" className="sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white text-shadow-ultra">
            주 40시간 진행률
          </h3>
          <p className="text-white/70 text-xs sm:text-sm text-shadow-strong">
            유연근무제 기준
          </p>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium text-shadow-strong">
            {currentHours.toFixed(1)}시간 / {targetHours}시간
          </span>
          <span className="text-white font-bold text-shadow-strong">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: getProgressColor()
            }}
          />
        </div>
        
        {/* 초과 진행률 표시 */}
        {isOvertime && overtimeHours > 0 && (
          <div className="w-full h-1 bg-red-500/30 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min((overtimeHours / targetHours) * 100, 100)}%`
              }}
            />
          </div>
        )}
      </div>

      {/* 상태 메시지 */}
      <BlurCard 
        intensity="light" 
        className={`p-3 mb-3 border ${
          isOvertime ? 'bg-red-500/10 border-red-500/30' :
          canTakeEarly ? 'bg-green-500/10 border-green-500/30' :
          'bg-blue-500/10 border-blue-500/30'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOvertime ? (
            <TrendingUp size={16} color="#EF4444" />
          ) : (
            <Clock size={16} color={getProgressColor()} />
          )}
          <p className="text-white font-medium text-xs sm:text-sm text-shadow-strong">
            {getStatusMessage()}
          </p>
        </div>
      </BlurCard>

      {/* 권장사항 */}
      <BlurCard intensity="light" className="p-3">
        <div className="flex items-start gap-2">
          <TrendingDown size={14} color="#10B981" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-400 font-medium text-xs mb-1">
              💡 권장사항
            </p>
            <p className="text-white/80 text-xs leading-relaxed">
              {getRecommendationMessage()}
            </p>
          </div>
        </div>
      </BlurCard>
    </BlurCard>
  );
});

export default WeeklyProgressCard;