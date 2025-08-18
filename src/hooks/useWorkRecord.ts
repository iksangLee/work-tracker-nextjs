import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { WorkRecord, WorkStats, WorkType } from '@/types/work-record';
import { storage, STORAGE_KEY } from '@/utils/storage';
import { createAutoBackup } from '@/utils/backup';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 한국 시간대(KST) 기준 날짜/시간 포맷팅
function formatDate(date: Date): string {
  // KST 기준으로 날짜 포맷팅 (YYYY-MM-DD)
  const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  return kstDate.toISOString().split('T')[0];
}

function formatTime(date: Date): string {
  // KST 기준으로 시간 포맷팅 (HH:mm)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  });
}

function clampWorkingHours(timeString: string): string {
  const WORK_START = '08:00';
  const WORK_END = '20:00';
  
  // 시간 비교를 위해 분 단위로 변환
  const timeToMinutes = (time: string): number => {
    const [hour, min] = time.split(':').map(Number);
    return hour * 60 + min;
  };
  
  const inputMinutes = timeToMinutes(timeString);
  const startMinutes = timeToMinutes(WORK_START);
  const endMinutes = timeToMinutes(WORK_END);
  
  // 인정 근무시간 범위로 제한
  const clampedMinutes = Math.max(startMinutes, Math.min(endMinutes, inputMinutes));
  
  // 다시 시:분 형식으로 변환
  const hours = Math.floor(clampedMinutes / 60);
  const minutes = clampedMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function calculateHours(clockIn: string, clockOut: string): number {
  // 인정 근무시간으로 제한 (08:00-20:00)
  const clampedClockIn = clampWorkingHours(clockIn);
  const clampedClockOut = clampWorkingHours(clockOut);
  
  const [inHour, inMin] = clampedClockIn.split(':').map(Number);
  const [outHour, outMin] = clampedClockOut.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  
  const totalMinutes = outMinutes - inMinutes;
  const totalHours = Math.max(0, totalMinutes / 60);
  
  // 휴게시간 자동 차감 (근로기준법 적용)
  return calculateWorkHoursWithBreak(totalHours);
}

function calculateWorkHoursWithBreak(totalHours: number): number {
  // 근로기준법에 따른 휴게시간 자동 차감
  if (totalHours >= 8) {
    // 8시간 이상 근무시 1시간 휴게시간 차감
    return totalHours - 1;
  } else if (totalHours >= 4) {
    // 4시간 이상 8시간 미만시 30분 휴게시간 차감
    return totalHours - 0.5;
  }
  // 4시간 미만은 휴게시간 없음
  return totalHours;
}

// 이 함수는 더 이상 사용되지 않음 - 제거됨

function calculateTotalHoursForHalfDay(workType: WorkType, clockIn?: string, clockOut?: string): number {
  if (workType !== 'morning_half' && workType !== 'afternoon_half') {
    return 0;
  }
  
  const baseVacationHours = 4; // 반차 기본 4시간
  
  if (clockIn && clockOut) {
    // 인정 근무시간으로 제한 (08:00-20:00)
    const clampedClockIn = clampWorkingHours(clockIn);
    const clampedClockOut = clampWorkingHours(clockOut);
    
    // 실제 근무시간 계산 (Raw 시간)
    const [inHour, inMin] = clampedClockIn.split(':').map(Number);
    const [outHour, outMin] = clampedClockOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    const totalMinutes = outMinutes - inMinutes;
    const rawWorkHours = Math.max(0, totalMinutes / 60);
    
    // 전체 총 시간 (반차 4시간 + 실제 근무시간)으로 휴게시간 차감 결정
    const totalCombinedHours = baseVacationHours + rawWorkHours;
    
    let finalWorkHours = rawWorkHours;
    
    if (totalCombinedHours >= 8) {
      // 전체 8시간 이상: 1시간 휴게시간 차감 (실제 근무시간에서만 차감)
      finalWorkHours = Math.max(0, rawWorkHours - 1);
    } else if (rawWorkHours >= 4) {
      // 실제 근무시간만 4시간 이상: 30분 휴게시간 차감
      finalWorkHours = Math.max(0, rawWorkHours - 0.5);
    }
    
    return baseVacationHours + finalWorkHours;
  }
  
  return baseVacationHours; // 출퇴근 기록이 없으면 반차 시간만
}

function getWeekStart(date: Date, offset: number = 0): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + (offset * 7)); // Add/subtract weeks
  const day = d.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  // 월요일(1)을 주의 시작으로 계산
  const daysFromMonday = day === 0 ? 6 : day - 1; // 일요일이면 6일 전, 나머지는 (현재요일-1)일 전
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
  return weekStart;
}

export function useWorkRecord() {
  const [currentStatus, setCurrentStatus] = useState<'out' | 'in'>('out');
  const [todayRecord, setTodayRecord] = useState<WorkRecord | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [currentWorkTime, setCurrentWorkTime] = useState<number>(0);
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ['work-records'],
    queryFn: async (): Promise<WorkRecord[]> => {
      try {
        const stored = await storage.getItem(STORAGE_KEY);
        const records: WorkRecord[] = stored ? JSON.parse(stored) : [];
        
        // 데이터 마이그레이션: 기존 기록에 workType 추가
        const migratedRecords = records.map(record => ({
          ...record,
          workType: record.workType || 'work' as WorkType
        }));
        
        // 마이그레이션이 필요했다면 저장
        if (records.some(record => !record.workType)) {
          await storage.setItem(STORAGE_KEY, JSON.stringify(migratedRecords));
        }
        
        return migratedRecords;
      } catch (error) {
        console.error('Failed to load work records:', error);
        return [];
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (records: WorkRecord[]) => {
      await storage.setItem(STORAGE_KEY, JSON.stringify(records));
      return records;
    },
    onSuccess: (records) => {
      queryClient.setQueryData(['work-records'], records);
      
      // 데이터 변경시 자동 백업 생성
      createAutoBackup().catch(error => {
        console.warn('자동 백업 생성 실패:', error);
      });
    }
  });

  const { mutate: saveMutate } = saveMutation;

  useEffect(() => {
    if (recordsQuery.data) {
      const today = formatDate(new Date());
      const todayRec = recordsQuery.data.find(r => r.date === today);
      setTodayRecord(todayRec || null);
      
      if (todayRec?.clockIn && !todayRec?.clockOut) {
        setCurrentStatus('in');
      } else {
        setCurrentStatus('out');
      }
    }
  }, [recordsQuery.data]);

  // 실시간 타이머 업데이트 (30초마다 = 배터리 최적화)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const TIMER_UPDATE_INTERVAL = 30 * 1000; // 30초
    
    if (currentStatus === 'in' && todayRecord?.clockIn) {
      const updateWorkTime = () => {
        const now = new Date();
        const today = formatDate(now);
        const currentTime = formatTime(now);
        
        if (todayRecord.date === today && todayRecord.clockIn) {
          const elapsedHours = calculateHours(todayRecord.clockIn, currentTime);
          setCurrentWorkTime(elapsedHours);
        }
      };

      // 즉시 한 번 실행
      updateWorkTime();
      
      // 30초마다 업데이트
      interval = setInterval(updateWorkTime, TIMER_UPDATE_INTERVAL);
    } else {
      setCurrentWorkTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStatus, todayRecord]);

  const clockIn = useCallback(() => {
    const now = new Date();
    const today = formatDate(now);
    const time = formatTime(now);
    
    const records = recordsQuery.data || [];
    const existingIndex = records.findIndex(r => r.date === today);
    
    let updatedRecords: WorkRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...records];
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        clockIn: time,
        clockOut: undefined,
        totalHours: undefined
      };
    } else {
      const newRecord: WorkRecord = {
        id: generateId(),
        date: today,
        workType: 'work', // 기본값: 일반 근무
        clockIn: time
      };
      updatedRecords = [...records, newRecord];
    }
    
    saveMutate(updatedRecords);
    setCurrentStatus('in');
  }, [recordsQuery.data, saveMutate]);

  const clockOut = useCallback(() => {
    const now = new Date();
    const today = formatDate(now);
    const time = formatTime(now);
    
    const records = recordsQuery.data || [];
    const existingIndex = records.findIndex(r => r.date === today);
    
    if (existingIndex >= 0 && records[existingIndex].clockIn) {
      const updatedRecords = [...records];
      const record = updatedRecords[existingIndex];
      record.clockOut = time;
      record.totalHours = calculateHours(record.clockIn!, time);
      
      saveMutate(updatedRecords);
      setCurrentStatus('out');
    }
  }, [recordsQuery.data, saveMutate]);

  const updateRecord = useCallback((recordId: string, updates: Partial<WorkRecord>) => {
    const records = recordsQuery.data || [];
    const updatedRecords = records.map(record => {
      if (record.id === recordId) {
        const updated = { ...record, ...updates };
        
        // 총 시간 계산
        if (updated.workType === 'annual_leave') {
          updated.totalHours = 8;
        } else if (updated.workType === 'morning_half' || updated.workType === 'afternoon_half') {
          updated.totalHours = calculateTotalHoursForHalfDay(updated.workType, updated.clockIn, updated.clockOut);
        } else if (updated.workType === 'work' && updated.clockIn && updated.clockOut) {
          updated.totalHours = calculateHours(updated.clockIn, updated.clockOut);
        }
        
        return updated;
      }
      return record;
    });
    
    saveMutate(updatedRecords);
  }, [recordsQuery.data, saveMutate]);

  const deleteRecord = useCallback((recordId: string) => {
    const records = recordsQuery.data || [];
    const updatedRecords = records.filter(r => r.id !== recordId);
    saveMutate(updatedRecords);
  }, [recordsQuery.data, saveMutate]);

  // 휴가 기록 추가/수정
  const addVacationRecord = useCallback((date: string, workType: WorkType) => {
    const records = recordsQuery.data || [];
    const existingIndex = records.findIndex(r => r.date === date);
    
    let updatedRecords: WorkRecord[];
    
    if (existingIndex >= 0) {
      // 기존 기록 업데이트
      updatedRecords = [...records];
      const existingRecord = updatedRecords[existingIndex];
      
      updatedRecords[existingIndex] = {
        ...existingRecord,
        workType,
        // 연차는 출퇴근 시간 제거, 반차는 유지
        clockIn: workType === 'annual_leave' ? undefined : existingRecord.clockIn,
        clockOut: workType === 'annual_leave' ? undefined : existingRecord.clockOut,
        // 총 시간 재계산
        totalHours: workType === 'annual_leave' 
          ? 8 
          : workType === 'morning_half' || workType === 'afternoon_half'
            ? calculateTotalHoursForHalfDay(workType, existingRecord.clockIn, existingRecord.clockOut)
            : existingRecord.totalHours
      };
    } else {
      // 새 휴가 기록 생성
      const newRecord: WorkRecord = {
        id: generateId(),
        date,
        workType,
        totalHours: workType === 'annual_leave' ? 8 : workType === 'morning_half' || workType === 'afternoon_half' ? 4 : undefined,
      };
      updatedRecords = [...records, newRecord];
    }
    
    saveMutate(updatedRecords);
  }, [recordsQuery.data, saveMutate]);

  const goToPreviousWeek = useCallback(() => {
    setWeekOffset(prev => prev - 1);
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekOffset(prev => prev + 1);
  }, []);

  const getWeeklyStats = useCallback((): WorkStats => {
    const records = recordsQuery.data || [];
    const now = new Date();
    const weekStart = getWeekStart(now, weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weeklyRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });

    const weeklyHours = weeklyRecords.reduce((total, record) => {
      // 휴가 타입에 따른 시간 계산
      if (record.workType === 'annual_leave') {
        return total + 8; // 연차는 8시간
      } else if (record.workType === 'morning_half' || record.workType === 'afternoon_half') {
        // 반차는 4시간 + 실제 근무시간
        return total + (record.totalHours || 4);
      }
      return total + (record.totalHours || 0);
    }, 0);

    return {
      weeklyHours,
      dailyRecords: weeklyRecords,
      currentWeekStart: formatDate(weekStart)
    };
  }, [recordsQuery.data, weekOffset]);

  // 주 40시간 진행률 계산
  const getWeeklyProgress = useCallback(() => {
    const stats = getWeeklyStats();
    const targetHours = 40;
    const currentHours = stats.weeklyHours;
    const progressPercentage = Math.min((currentHours / targetHours) * 100, 100);
    
    return {
      currentHours,
      targetHours,
      progressPercentage,
      remainingHours: Math.max(targetHours - currentHours, 0),
      isOvertime: currentHours > targetHours,
      overtimeHours: Math.max(currentHours - targetHours, 0)
    };
  }, [getWeeklyStats]);

  // 일일 권장 근무시간 계산
  const getDailyRecommendation = useCallback(() => {
    const progress = getWeeklyProgress();
    const today = new Date();
    const weekStart = getWeekStart(today, weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // 이번 주 남은 근무 일수 계산
    let remainingWorkDays = 0;
    for (let d = new Date(today); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 주말 제외
        remainingWorkDays++;
      }
    }
    
    const recommendedDailyHours = remainingWorkDays > 0 
      ? progress.remainingHours / remainingWorkDays 
      : 0;
    
    return {
      remainingWorkDays,
      recommendedDailyHours: Math.max(recommendedDailyHours, 0),
      canTakeEarly: progress.currentHours >= progress.targetHours
    };
  }, [getWeeklyProgress, weekOffset]);

  const getWeeklyRecords = useCallback((): WorkRecord[] => {
    const records = recordsQuery.data || [];
    const now = new Date();
    const weekStart = getWeekStart(now, weekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });
  }, [recordsQuery.data, weekOffset]);

  return useMemo(() => ({
    records: recordsQuery.data || [],
    currentStatus,
    todayRecord,
    currentWorkTime,
    isLoading: recordsQuery.isLoading,
    clockIn,
    clockOut,
    updateRecord,
    deleteRecord,
    addVacationRecord,
    getWeeklyStats,
    getWeeklyProgress,
    getDailyRecommendation,
    weekOffset,
    getWeeklyRecords,
    goToPreviousWeek,
    goToNextWeek,
  }), [
    recordsQuery.data, 
    currentStatus, 
    todayRecord, 
    currentWorkTime,
    recordsQuery.isLoading, 
    clockIn, 
    clockOut, 
    updateRecord, 
    deleteRecord, 
    addVacationRecord,
    getWeeklyStats, 
    getWeeklyProgress,
    getDailyRecommendation,
    weekOffset, 
    getWeeklyRecords, 
    goToPreviousWeek, 
    goToNextWeek
  ]);
}