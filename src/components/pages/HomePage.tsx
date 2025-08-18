'use client';

import { useState, useMemo, useCallback } from 'react';
import { LogIn, LogOut, Settings } from 'lucide-react';
import { useWorkRecord } from '@/hooks/useWorkRecord';
import { WorkType } from '@/types/work-record';
import BlurCard from '@/components/ui/BlurCard';
import GradientButton from '@/components/ui/GradientButton';
import InstallPrompt from '@/components/ui/InstallPrompt';
import WeeklyProgressCard from '@/components/ui/WeeklyProgressCard';
import BreakTimeInfo from '@/components/ui/BreakTimeInfo';
import VacationSelector from '@/components/ui/VacationSelector';

export default function HomePage() {
  const { 
    currentStatus, 
    todayRecord, 
    currentWorkTime, 
    clockIn, 
    clockOut, 
    addVacationRecord,
    isLoading,
    getWeeklyProgress,
    getDailyRecommendation
  } = useWorkRecord();
  
  const [showVacationSelector, setShowVacationSelector] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType>('work');

  const getCurrentTime = useCallback(() => {
    return new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, []);

  const getCurrentDate = useMemo(() => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }, []);

  const getStatusText = useMemo(() => {
    if (currentStatus === 'in') {
      return '근무 중';
    }
    if (todayRecord?.clockOut) {
      return '퇴근 완료';
    }
    if (todayRecord?.workType === 'morning_half') {
      return '오전 반차 + 근무';
    }
    if (todayRecord?.workType === 'afternoon_half') {
      return '오후 반차 + 근무';
    }
    if (todayRecord?.workType === 'annual_leave') {
      return '연차';
    }
    return '출근 전';
  }, [currentStatus, todayRecord?.clockOut, todayRecord?.workType]);

  const getStatusColor = useMemo(() => {
    if (currentStatus === 'in') return '#10B981';
    if (todayRecord?.clockOut) return '#6B7280';
    return '#3B82F6';
  }, [currentStatus, todayRecord?.clockOut]);

  const weeklyProgress = useMemo(() => getWeeklyProgress(), [getWeeklyProgress]);
  const dailyRecommendation = useMemo(() => getDailyRecommendation(), [getDailyRecommendation]);

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
      <header className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-shadow-ultra mb-3">
          출퇴근 기록
        </h1>
        <div 
          className="text-base sm:text-lg text-white text-shadow-strong mb-1"
          role="text"
          aria-label="현재 날짜"
        >
          {getCurrentDate}
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
      <div className="px-4 sm:px-6 mb-4 sm:mb-6">
        <BlurCard className="p-5 sm:p-6" role="region" aria-label="현재 근무 상태">
          <div className="text-center">
            <div 
              className="w-5 h-5 rounded-full mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: getStatusColor }}
              role="img"
              aria-label={`상태 표시: ${getStatusText}`}
            />
            <div 
              className="text-xl sm:text-2xl font-bold text-white text-shadow-ultra mb-4 sm:mb-5"
              role="status"
              aria-live="polite"
            >
              {getStatusText}
            </div>
            
            {todayRecord && (todayRecord.clockIn || todayRecord.clockOut) && (
              <div className="space-y-3">
                <div className="flex gap-2 sm:gap-3">
                  {todayRecord.clockIn && (
                    <BlurCard intensity="light" className="flex-1 flex justify-between items-center px-3 sm:px-4 py-3 min-h-[48px]">
                      <span className="text-white font-medium text-sm sm:text-base text-shadow-strong">출근</span>
                      <span className="text-white font-semibold text-base sm:text-lg text-shadow-strong">
                        {todayRecord.clockIn}
                      </span>
                    </BlurCard>
                  )}
                  {todayRecord.clockOut && (
                    <BlurCard intensity="light" className="flex-1 flex justify-between items-center px-3 sm:px-4 py-3 min-h-[48px]">
                      <span className="text-white font-medium text-sm sm:text-base text-shadow-strong">퇴근</span>
                      <span className="text-white font-semibold text-base sm:text-lg text-shadow-strong">
                        {todayRecord.clockOut}
                      </span>
                    </BlurCard>
                  )}
                </div>
                {/* 실시간 근무시간 표시 (근무 중일 때) */}
                {currentStatus === 'in' && currentWorkTime > 0 && (
                  <>
                    <BlurCard className="px-3 sm:px-4 py-3 bg-blue-400/20 border-blue-400/30 min-h-[48px] flex items-center justify-center glow-blue">
                      <span className="text-blue-400 font-semibold text-sm sm:text-base text-shadow-strong">
                        현재 근무시간: {currentWorkTime.toFixed(1)}시간 ⏱️
                      </span>
                    </BlurCard>
                    {/* 실시간 휴게시간 정보 */}
                    {todayRecord?.clockIn && (
                      <BreakTimeInfo 
                        totalHours={(() => {
                          const now = new Date();
                          const currentTime = now.toTimeString().slice(0, 5);
                          
                          // 인정 근무시간으로 제한 (08:00-20:00)
                          const clampTime = (time: string): string => {
                            const [h, m] = time.split(':').map(Number);
                            const minutes = h * 60 + m;
                            const clampedMinutes = Math.max(480, Math.min(1200, minutes)); // 08:00(480분) ~ 20:00(1200분)
                            const hours = Math.floor(clampedMinutes / 60);
                            const mins = clampedMinutes % 60;
                            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                          };
                          
                          const clampedClockIn = clampTime(todayRecord.clockIn);
                          const clampedCurrentTime = clampTime(currentTime);
                          
                          const [inHour, inMin] = clampedClockIn.split(':').map(Number);
                          const [outHour, outMin] = clampedCurrentTime.split(':').map(Number);
                          const inMinutes = inHour * 60 + inMin;
                          const outMinutes = outHour * 60 + outMin;
                          return Math.max(0, (outMinutes - inMinutes) / 60);
                        })()}
                        workHours={currentWorkTime}
                      />
                    )}
                  </>
                )}
                
                {/* 완료된 근무시간 표시 (퇴근 후) */}
                {todayRecord?.totalHours !== undefined && todayRecord.totalHours > 0 && currentStatus === 'out' && (
                  <>
                    <BlurCard className="px-3 sm:px-4 py-3 bg-emerald-400/20 border-emerald-400/30 min-h-[48px] flex items-center justify-center glow-emerald">
                      <span className="text-emerald-400 font-semibold text-sm sm:text-base text-shadow-strong">
                        총 근무시간: {todayRecord.totalHours.toFixed(1)}시간
                      </span>
                    </BlurCard>
                    {/* 완료된 휴게시간 정보 */}
                    {todayRecord.clockIn && todayRecord.clockOut && (
                      <BreakTimeInfo 
                        totalHours={(() => {
                          // 인정 근무시간으로 제한 (08:00-20:00)
                          const clampTime = (time: string): string => {
                            const [h, m] = time.split(':').map(Number);
                            const minutes = h * 60 + m;
                            const clampedMinutes = Math.max(480, Math.min(1200, minutes)); // 08:00(480분) ~ 20:00(1200분)
                            const hours = Math.floor(clampedMinutes / 60);
                            const mins = clampedMinutes % 60;
                            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                          };
                          
                          const clampedClockIn = clampTime(todayRecord.clockIn);
                          const clampedClockOut = clampTime(todayRecord.clockOut);
                          
                          const [inHour, inMin] = clampedClockIn.split(':').map(Number);
                          const [outHour, outMin] = clampedClockOut.split(':').map(Number);
                          const inMinutes = inHour * 60 + inMin;
                          const outMinutes = outHour * 60 + outMin;
                          return Math.max(0, (outMinutes - inMinutes) / 60);
                        })()}
                        workHours={todayRecord.totalHours}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </BlurCard>
      </div>

      {/* Vacation Type Selector */}
      {showVacationSelector && (
        <div className="px-4 sm:px-6 pb-4">
          <BlurCard className="p-4">
            <VacationSelector
              selectedType={selectedWorkType}
              onSelect={setSelectedWorkType}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowVacationSelector(false)}
                className="flex-1 py-2 text-white/70 hover:text-white text-sm transition-colors"
              >
                취소
              </button>
              <GradientButton
                variant="primary"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  addVacationRecord(today, selectedWorkType);
                  setShowVacationSelector(false);
                }}
                className="flex-1 py-2 text-sm font-medium"
              >
                적용
              </GradientButton>
            </div>
          </BlurCard>
        </div>
      )}

      {/* Action Button */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 justify-center">
          {/* 연차가 아닐 때만 출퇴근 버튼 표시 */}
          {todayRecord?.workType !== 'annual_leave' && (
            currentStatus === 'out' ? (
              <GradientButton 
                variant="clockIn" 
                onClick={clockIn}
                className="flex-1 max-w-xs min-h-[56px] text-lg sm:text-xl font-bold focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
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
                className="flex-1 max-w-xs min-h-[56px] text-lg sm:text-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50"
                aria-label="퇴근 기록하기"
                role="button"
                tabIndex={0}
              >
                <LogOut size={24} aria-hidden="true" />
                <span>퇴근</span>
              </GradientButton>
            )
          )}
          
          {/* 연차일 때 안내 메시지 */}
          {todayRecord?.workType === 'annual_leave' && (
            <div className="flex-1 max-w-xs text-center">
              <div className="text-green-400 text-lg font-bold">🏖️ 연차 (8시간)</div>
              <div className="text-white/70 text-sm">휴식을 취하세요</div>
            </div>
          )}
          
          {/* Vacation Settings Button */}
          <button
            onClick={() => setShowVacationSelector(!showVacationSelector)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="휴가 설정"
          >
            <Settings size={24} color="white" />
          </button>
        </div>
      </div>

      {/* Weekly Progress Card - 최하단 배치 */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8">
        <WeeklyProgressCard
          currentHours={weeklyProgress.currentHours}
          targetHours={weeklyProgress.targetHours}
          progressPercentage={weeklyProgress.progressPercentage}
          remainingHours={weeklyProgress.remainingHours}
          isOvertime={weeklyProgress.isOvertime}
          overtimeHours={weeklyProgress.overtimeHours}
          recommendedDailyHours={dailyRecommendation.recommendedDailyHours}
          remainingWorkDays={dailyRecommendation.remainingWorkDays}
          canTakeEarly={dailyRecommendation.canTakeEarly}
        />
      </div>
    </div>
  );
}