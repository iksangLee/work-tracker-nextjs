import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { WorkRecord, WorkStats } from '@/types/work-record';
import { storage, STORAGE_KEY } from '@/utils/storage';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function calculateHours(clockIn: string, clockOut: string): number {
  const [inHour, inMin] = clockIn.split(':').map(Number);
  const [outHour, outMin] = clockOut.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  
  return Math.max(0, (outMinutes - inMinutes) / 60);
}

function getWeekStart(date: Date, offset: number = 0): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + (offset * 7)); // Add/subtract weeks
  const day = d.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const diff = d.getDate() - (day === 0 ? 6 : day - 1); // Adjust for Monday start
  return new Date(d.setDate(diff));
}

export function useWorkRecord() {
  const [currentStatus, setCurrentStatus] = useState<'out' | 'in'>('out');
  const [todayRecord, setTodayRecord] = useState<WorkRecord | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ['work-records'],
    queryFn: async (): Promise<WorkRecord[]> => {
      try {
        const stored = await storage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
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
        if (updated.clockIn && updated.clockOut) {
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
      return total + (record.totalHours || 0);
    }, 0);

    return {
      weeklyHours,
      dailyRecords: weeklyRecords,
      currentWeekStart: formatDate(weekStart)
    };
  }, [recordsQuery.data, weekOffset]);

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
    isLoading: recordsQuery.isLoading,
    clockIn,
    clockOut,
    updateRecord,
    deleteRecord,
    getWeeklyStats,
    weekOffset,
    getWeeklyRecords,
    goToPreviousWeek,
    goToNextWeek,
  }), [
    recordsQuery.data, 
    currentStatus, 
    todayRecord, 
    recordsQuery.isLoading, 
    clockIn, 
    clockOut, 
    updateRecord, 
    deleteRecord, 
    getWeeklyStats, 
    weekOffset, 
    getWeeklyRecords, 
    goToPreviousWeek, 
    goToNextWeek
  ]);
}