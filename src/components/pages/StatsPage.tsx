'use client';

import { Calendar, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkRecord } from '@/hooks/useWorkRecord';
import BlurCard from '@/components/ui/BlurCard';

export default function StatsPage() {
  const { getWeeklyStats, isLoading, weekOffset, goToPreviousWeek, goToNextWeek } = useWorkRecord();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/80 text-lg font-medium">로딩 중...</div>
        </div>
      </div>
    );
  }

  const stats = getWeeklyStats();
  const averageDaily = stats.weeklyHours / 7;

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="pt-12 sm:pt-16 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-shadow-strong mb-3 sm:mb-4">
          주간 통계
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button 
            onClick={goToPreviousWeek} 
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-lg"
            aria-label="이전 주로 이동"
            tabIndex={0}
          >
            <ChevronLeft color="#FFFFFF" size={24} aria-hidden="true" />
          </button>
          <div 
            className="text-sm sm:text-lg text-white/80 text-shadow text-center px-2"
            role="status"
            aria-live="polite"
          >
            {stats.currentWeekStart} - {formatDate(new Date(new Date(stats.currentWeekStart).setDate(new Date(stats.currentWeekStart).getDate() + 6)))}
            {weekOffset === 0 ? ' (이번 주)' : ''}
          </div>
          <button 
            onClick={goToNextWeek} 
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-lg"
            aria-label="다음 주로 이동"
            tabIndex={0}
          >
            <ChevronRight color="#FFFFFF" size={24} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 sm:px-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <BlurCard className="p-3 sm:p-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-full glass-effect flex items-center justify-center shadow-lg">
              <Clock color="#007AFF" size={20} />
            </div>
            <div className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">총 근무시간</div>
            <div className="text-white text-lg sm:text-2xl font-bold text-shadow">
              {stats.weeklyHours.toFixed(1)}시간
            </div>
          </BlurCard>

          <BlurCard className="p-3 sm:p-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-full glass-effect flex items-center justify-center shadow-lg">
              <TrendingUp color="#34D399" size={20} />
            </div>
            <div className="text-white/80 text-xs sm:text-sm font-medium mb-1 sm:mb-2">일평균 근무시간</div>
            <div className="text-white text-lg sm:text-2xl font-bold text-shadow">
              {averageDaily.toFixed(1)}시간
            </div>
          </BlurCard>
        </div>
      </div>

      {/* Daily Records */}
      <div className="px-4 sm:px-6 mb-4 sm:mb-6">
        <BlurCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Calendar color="rgba(255, 255, 255, 0.8)" size={18} />
            <h2 className="text-lg sm:text-xl font-semibold text-white text-shadow">일별 근무시간</h2>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date(stats.currentWeekStart);
              date.setDate(date.getDate() + index);
              const dateString = date.toISOString().split('T')[0];
              
              const record = stats.dailyRecords.find(r => r.date === dateString);
              const hours = record?.totalHours || 0;
              const isToday = dateString === new Date().toISOString().split('T')[0];

              return (
                <BlurCard 
                  key={dateString} 
                  intensity="light" 
                  className={`p-3 sm:p-4 min-h-[56px] ${isToday ? 'border-blue-500 border-2' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`font-semibold text-sm sm:text-base ${isToday ? 'text-blue-400' : 'text-white'}`}>
                        {getDayName(dateString)}
                      </div>
                      <div className={`text-xs sm:text-sm ${isToday ? 'text-blue-300' : 'text-white/70'}`}>
                        {formatDate(dateString)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {record?.clockIn && (
                        <div className="text-xs text-white/60 mb-1">
                          {record.clockIn} - {record.clockOut || '진행중'}
                        </div>
                      )}
                      <div className={`font-semibold text-sm sm:text-base ${hours > 0 ? 'text-emerald-400' : 'text-white/70'}`}>
                        {hours > 0 ? `${hours.toFixed(1)}시간` : '기록 없음'}
                      </div>
                    </div>
                  </div>
                </BlurCard>
              );
            })}
          </div>
        </BlurCard>
      </div>

      {/* Weekly Chart */}
      <div className="px-4 sm:px-6 mb-20 sm:mb-24">
        <BlurCard className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white text-shadow mb-4 sm:mb-6">주간 근무 패턴</h2>
          <div className="flex items-end justify-between h-32 sm:h-36 gap-1 sm:gap-2">
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date(stats.currentWeekStart);
              date.setDate(date.getDate() + index);
              const dateString = date.toISOString().split('T')[0];
              
              const record = stats.dailyRecords.find(r => r.date === dateString);
              const hours = record?.totalHours || 0;
              const maxHours = Math.max(...stats.dailyRecords.map(r => r.totalHours || 0), 8);
              const height = Math.max((hours / maxHours) * 120, 4);

              return (
                <div key={dateString} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-7 sm:w-8 rounded-lg mb-2 sm:mb-3 transition-all duration-300 shadow-lg ${
                      hours > 0 ? 'bg-blue-500' : 'bg-white/30'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="text-xs text-white/80 font-medium text-center">
                    {getDayName(dateString)}
                  </div>
                </div>
              );
            })}
          </div>
        </BlurCard>
      </div>
    </div>
  );
}