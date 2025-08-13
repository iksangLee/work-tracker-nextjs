'use client';

import { LogIn, LogOut } from 'lucide-react';
import { useWorkRecord } from '@/hooks/useWorkRecord';
import BlurCard from '@/components/ui/BlurCard';
import GradientButton from '@/components/ui/GradientButton';
import InstallPrompt from '@/components/ui/InstallPrompt';

export default function HomePage() {
  const { currentStatus, todayRecord, clockIn, clockOut, isLoading } = useWorkRecord();

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusText = () => {
    if (currentStatus === 'in') {
      return '근무 중';
    }
    if (todayRecord?.clockOut) {
      return '퇴근 완료';
    }
    return '출근 전';
  };

  const getStatusColor = () => {
    if (currentStatus === 'in') return '#10B981';
    if (todayRecord?.clockOut) return '#6B7280';
    return '#3B82F6';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/80 text-lg font-medium">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <InstallPrompt />
      {/* Header */}
      <header className="pt-12 sm:pt-16 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-shadow-ultra mb-2">
          출퇴근 기록
        </h1>
        <div 
          className="text-base sm:text-lg text-white text-shadow-strong mb-1"
          role="text"
          aria-label="현재 날짜"
        >
          {getCurrentDate()}
        </div>
        <div 
          className="text-lg sm:text-xl text-white text-shadow-strong"
          role="timer"
          aria-live="off"
          aria-label="현재 시간"
        >
          {getCurrentTime()}
        </div>
      </header>

      {/* Status Card */}
      <div className="px-4 sm:px-6 mb-6 sm:mb-8">
        <BlurCard className="p-5 sm:p-6" role="region" aria-label="현재 근무 상태">
          <div className="text-center">
            <div 
              className="w-5 h-5 rounded-full mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: getStatusColor() }}
              role="img"
              aria-label={`상태 표시: ${getStatusText()}`}
            />
            <div 
              className="text-xl sm:text-2xl font-bold text-white text-shadow-ultra mb-4 sm:mb-5"
              role="status"
              aria-live="polite"
            >
              {getStatusText()}
            </div>
            
            {todayRecord && (
              <div className="space-y-3">
                {todayRecord.clockIn && (
                  <BlurCard intensity="light" className="flex justify-between items-center px-3 sm:px-4 py-3 min-h-[48px]">
                    <span className="text-white font-medium text-sm sm:text-base text-shadow-strong">출근</span>
                    <span className="text-white font-semibold text-base sm:text-lg text-shadow-strong">
                      {todayRecord.clockIn}
                    </span>
                  </BlurCard>
                )}
                {todayRecord.clockOut && (
                  <BlurCard intensity="light" className="flex justify-between items-center px-3 sm:px-4 py-3 min-h-[48px]">
                    <span className="text-white font-medium text-sm sm:text-base text-shadow-strong">퇴근</span>
                    <span className="text-white font-semibold text-base sm:text-lg text-shadow-strong">
                      {todayRecord.clockOut}
                    </span>
                  </BlurCard>
                )}
                {todayRecord.totalHours !== undefined && todayRecord.totalHours > 0 && (
                  <BlurCard className="px-3 sm:px-4 py-3 bg-emerald-400/20 border-emerald-400/30 min-h-[48px] flex items-center justify-center glow-emerald">
                    <span className="text-emerald-400 font-semibold text-sm sm:text-base text-shadow-strong">
                      총 근무시간: {todayRecord.totalHours.toFixed(1)}시간
                    </span>
                  </BlurCard>
                )}
              </div>
            )}
          </div>
        </BlurCard>
      </div>

      {/* Action Button */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-8 flex justify-center">
        {currentStatus === 'out' ? (
          <GradientButton 
            variant="clockIn" 
            onClick={clockIn}
            className="w-full max-w-xs min-h-[56px] text-lg sm:text-xl font-bold focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
            aria-label="출근 기록하기"
            role="button"
            tabIndex={0}
          >
            <LogIn size={24} aria-hidden="true" />
            <span>출근</span>
          </GradientButton>
        ) : (
          <GradientButton 
            variant="clockOut" 
            onClick={clockOut}
            className="w-full max-w-xs min-h-[56px] text-lg sm:text-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
            aria-label="퇴근 기록하기"
            role="button"
            tabIndex={0}
          >
            <LogOut size={24} aria-hidden="true" />
            <span>퇴근</span>
          </GradientButton>
        )}
      </div>
    </div>
  );
}