'use client';

import { useState } from 'react';
import { Edit3, Trash2, Save, X, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { useWorkRecord } from '@/hooks/useWorkRecord';
import { WorkRecord, WorkType } from '@/types/work-record';
import BlurCard from '@/components/ui/BlurCard';
import GradientButton from '@/components/ui/GradientButton';
import BackupManager from '@/components/ui/BackupManager';
import BreakTimeInfo from '@/components/ui/BreakTimeInfo';
import VacationSelector from '@/components/ui/VacationSelector';
import { getVacationStyle, isVacationType } from '@/utils/vacation';

export default function RecordsPage() {
  const { records, updateRecord, deleteRecord, isLoading, getWeeklyRecords, weekOffset, goToPreviousWeek, goToNextWeek } = useWorkRecord();
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);
  const [editForm, setEditForm] = useState({ clockIn: '', clockOut: '', workType: 'work' as WorkType });
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/80 text-lg font-medium">로딩 중...</div>
        </div>
      </div>
    );
  }

  const weeklyRecords = getWeeklyRecords();
  const allRecords = records || [];
  const displayRecords = showAllRecords ? allRecords : weeklyRecords;
  const sortedRecords = [...displayRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const actualDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;

    if (dateString === today.toISOString().split('T')[0]) {
      return `오늘 (${actualDate})`;
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return `어제 (${actualDate})`;
    } else {
      return actualDate;
    }
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const handleEdit = (record: WorkRecord) => {
    setEditingRecord(record);
    setEditForm({
      clockIn: record.clockIn || '',
      clockOut: record.clockOut || '',
      workType: record.workType || 'work'
    });
  };

  const handleSave = () => {
    if (!editingRecord) return;

    // 일반 근무인 경우 시간 유효성 검사
    if (editForm.workType === 'work' && editForm.clockIn && editForm.clockOut) {
      const clockInTime = editForm.clockIn.split(':').map(Number);
      const clockOutTime = editForm.clockOut.split(':').map(Number);
      
      if (clockInTime[0] * 60 + clockInTime[1] >= clockOutTime[0] * 60 + clockOutTime[1]) {
        alert('퇴근 시간은 출근 시간보다 늦어야 합니다.');
        return;
      }
    }

    // 휴가 타입에 따른 업데이트
    const updates: Partial<WorkRecord> = {
      workType: editForm.workType
    };

    if (editForm.workType === 'work') {
      // 일반 근무: 출퇴근 시간 설정
      updates.clockIn = editForm.clockIn || undefined;
      updates.clockOut = editForm.clockOut || undefined;
      updates.totalHours = undefined; // calculateHours로 자동 계산
    } else if (editForm.workType === 'annual_leave') {
      // 연차: 8시간 고정, 출퇴근 시간 제거
      updates.totalHours = 8;
      updates.clockIn = undefined;
      updates.clockOut = undefined;
    } else {
      // 반차: 4시간 + 실제 근무시간, 출퇴근 시간 유지
      updates.clockIn = editForm.clockIn || undefined;
      updates.clockOut = editForm.clockOut || undefined;
      updates.totalHours = undefined; // calculateTotalHoursForHalfDay로 자동 계산
    }

    updateRecord(editingRecord.id, updates);

    setEditingRecord(null);
    setEditForm({ clockIn: '', clockOut: '', workType: 'work' });
  };

  const handleDelete = (record: WorkRecord) => {
    if (confirm(`${formatDate(record.date)} 기록을 삭제하시겠습니까?`)) {
      deleteRecord(record.id);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="pt-12 sm:pt-16 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-shadow-ultra mb-3 sm:mb-4">
          근무 기록
        </h1>
        
        {/* 백업 버튼 및 전체 기록 보기 */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setShowBackupManager(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors"
          >
            <Archive size={16} />
            <span>데이터 백업</span>
          </button>
          <button
            onClick={() => setShowAllRecords(!showAllRecords)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              showAllRecords 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {showAllRecords ? '주간 보기' : '전체 보기'}
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button onClick={goToPreviousWeek} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ChevronLeft color="#FFFFFF" size={24} />
          </button>
          <div className="text-sm sm:text-lg text-white text-shadow-strong text-center px-2">
            {weekOffset === 0 ? '이번 주' : `${weekOffset > 0 ? `${weekOffset}주 후` : `${Math.abs(weekOffset)}주 전`}`}
          </div>
          <button onClick={goToNextWeek} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ChevronRight color="#FFFFFF" size={24} />
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="px-4 sm:px-6 pb-20 sm:pb-24">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-12 sm:py-16" role="status" aria-live="polite">
            <div className="text-lg sm:text-xl text-white font-semibold mb-2 text-shadow-strong">아직 기록이 없습니다</div>
            <div className="text-base sm:text-lg text-white text-shadow-strong">홈 화면에서 출퇴근을 기록해보세요</div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4" role="list" aria-label="근무 기록 목록">
            {sortedRecords.map((record) => {
              const vacationStyle = getVacationStyle(record.workType || 'work');
              const isVacation = isVacationType(record.workType || 'work');
              
              return (
                <BlurCard 
                  key={record.id} 
                  intensity="strong" 
                  className={`p-4 sm:p-5 ${isVacation ? `${vacationStyle.bgColor} ${vacationStyle.borderColor} border-2` : ''}`}
                  role="listitem"
                >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl sm:text-2xl font-bold text-white text-shadow-ultra">
                        {formatDate(record.date)}
                      </span>
                      {isVacation && (
                        <span className="text-lg">{vacationStyle.icon}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg text-white font-medium text-shadow-strong">
                        {getDayName(record.date)}
                      </span>
                      {isVacation && (
                        <span className={`text-xs px-2 py-1 rounded-full ${vacationStyle.bgColor} ${vacationStyle.textColor} font-medium`}>
                          {vacationStyle.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <button 
                      className="p-2 sm:p-3 rounded-xl glass-effect hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                      onClick={() => handleEdit(record)}
                      aria-label={`${formatDate(record.date)} 기록 수정`}
                      tabIndex={0}
                    >
                      <Edit3 color="#007AFF" size={18} aria-hidden="true" />
                    </button>
                    <button 
                      className="p-2 sm:p-3 rounded-xl glass-effect hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                      onClick={() => handleDelete(record)}
                      aria-label={`${formatDate(record.date)} 기록 삭제`}
                      tabIndex={0}
                    >
                      <Trash2 color="#FF3B30" size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex gap-2 sm:gap-3">
                    <BlurCard intensity="light" className="flex-1 flex justify-between items-center px-3 sm:px-4 py-3 min-h-[48px]">
                      <span className="text-white font-semibold text-sm sm:text-base text-shadow-strong">출근</span>
                      <span className="text-white font-bold text-base sm:text-lg text-shadow-strong">
                        {record.clockIn || '기록 없음'}
                      </span>
                    </BlurCard>
                    
                    <BlurCard intensity="light" className="flex-1 flex justify-between items-center px-3 sm:px-4 py-3 min-h-[48px]">
                      <span className="text-white font-semibold text-sm sm:text-base text-shadow-strong">퇴근</span>
                      <span className="text-white font-bold text-base sm:text-lg text-shadow-strong">
                        {record.clockOut || '기록 없음'}
                      </span>
                    </BlurCard>
                  </div>
                  
                  {/* 근무시간 또는 휴가시간 표시 */}
                  {(record.totalHours !== undefined && record.totalHours > 0) && (
                    <>
                      <BlurCard className={`px-3 sm:px-4 py-3 min-h-[48px] ${
                        isVacation 
                          ? `${vacationStyle.bgColor} ${vacationStyle.borderColor} border`
                          : 'bg-emerald-400/20 border-emerald-400/30 glow-emerald'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold text-sm sm:text-base text-shadow-strong ${
                            isVacation ? vacationStyle.textColor : 'text-white'
                          }`}>
                            총 근무시간
                          </span>
                          <span className={`font-bold text-base sm:text-lg text-shadow-strong ${
                            isVacation ? vacationStyle.textColor : 'text-white'
                          }`}>
                            {record.totalHours?.toFixed(1)}시간
                          </span>
                        </div>
                      </BlurCard>
                      
                      {/* 휴게시간 정보 */}
                      {record.clockIn && record.clockOut && (record.workType === 'work' || record.workType === 'morning_half' || record.workType === 'afternoon_half') && (
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
                            
                            const clampedClockIn = clampTime(record.clockIn);
                            const clampedClockOut = clampTime(record.clockOut);
                            
                            const [inHour, inMin] = clampedClockIn.split(':').map(Number);
                            const [outHour, outMin] = clampedClockOut.split(':').map(Number);
                            const inMinutes = inHour * 60 + inMin;
                            const outMinutes = outHour * 60 + outMin;
                            return Math.max(0, (outMinutes - inMinutes) / 60);
                          })()}
                          workHours={record.totalHours || 0}
                        />
                      )}
                    </>
                  )}
                </div>
                </BlurCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 sm:p-6 z-[110]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <BlurCard intensity="strong" className="w-full max-w-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 
                id="modal-title"
                className="text-xl sm:text-2xl font-semibold text-white text-shadow-ultra"
              >
                기록 수정
              </h2>
              <button 
                onClick={() => setEditingRecord(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 rounded-lg"
                aria-label="모달 닫기"
                tabIndex={0}
              >
                <X color="rgba(255, 255, 255, 0.8)" size={24} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 mb-4 sm:mb-6">
              {/* 휴가 타입 선택 */}
              <div>
                <VacationSelector
                  selectedType={editForm.workType}
                  onSelect={(type) => setEditForm(prev => ({ ...prev, workType: type }))}
                />
              </div>

              {/* 일반 근무 또는 반차인 경우 출퇴근 시간 입력 */}
              {(editForm.workType === 'work' || editForm.workType === 'morning_half' || editForm.workType === 'afternoon_half') && (
                <>
                  <div>
                    <label 
                      htmlFor="clockin-input"
                      className="block text-base sm:text-lg font-medium text-white mb-2 text-shadow-strong"
                    >
                      출근 시간
                    </label>
                    <input
                      id="clockin-input"
                      type="text"
                      className="w-full px-3 sm:px-4 py-3 rounded-xl glass-effect text-white placeholder-white/50 border-white/30 text-base min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      value={editForm.clockIn}
                      onChange={(e) => setEditForm(prev => ({ ...prev, clockIn: e.target.value }))}
                      placeholder="09:00"
                      aria-describedby="clockin-help"
                    />
                    <div id="clockin-help" className="sr-only">
                      시:분 형식으로 입력하세요 (예: 09:00)
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="clockout-input"
                      className="block text-base sm:text-lg font-medium text-white mb-2 text-shadow-strong"
                    >
                      퇴근 시간
                    </label>
                    <input
                      id="clockout-input"
                      type="text"
                      className="w-full px-3 sm:px-4 py-3 rounded-xl glass-effect text-white placeholder-white/50 border-white/30 text-base min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      value={editForm.clockOut}
                      onChange={(e) => setEditForm(prev => ({ ...prev, clockOut: e.target.value }))}
                      placeholder="18:00"
                      aria-describedby="clockout-help"
                    />
                    <div id="clockout-help" className="sr-only">
                      시:분 형식으로 입력하세요 (예: 18:00)
                    </div>
                  </div>
                </>
              )}

              {/* 휴가 선택시 안내 메시지 */}
              {editForm.workType === 'annual_leave' && (
                <div className="p-3 bg-green-400/10 border border-green-400/20 rounded-xl">
                  <p className="text-green-400 text-sm">
                    연차 선택시 8시간이 자동으로 기록됩니다. 출퇴근 시간은 무시됩니다.
                  </p>
                </div>
              )}
              
              {(editForm.workType === 'morning_half' || editForm.workType === 'afternoon_half') && (
                <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl">
                  <p className="text-amber-400 text-sm">
                    {getVacationStyle(editForm.workType).label} 선택시 4시간 + 실제 근무시간이 합산됩니다.
                  </p>
                </div>
              )}
            </div>

            <GradientButton 
              variant="save" 
              onClick={handleSave} 
              className="w-full min-h-[52px] text-base sm:text-lg font-bold focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
              aria-label="기록 저장하기"
              tabIndex={0}
            >
              <Save size={20} aria-hidden="true" />
              <span>저장</span>
            </GradientButton>
          </BlurCard>
        </div>
      )}
      
      {/* Backup Manager Modal */}
      {showBackupManager && (
        <BackupManager onClose={() => setShowBackupManager(false)} />
      )}
    </div>
  );
}