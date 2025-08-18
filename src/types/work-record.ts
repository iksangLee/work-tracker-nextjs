export type WorkType = 'work' | 'annual_leave' | 'morning_half' | 'afternoon_half';

export interface WorkRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  workType: WorkType; // 근무 타입
  clockIn?: string; // HH:MM format
  clockOut?: string; // HH:MM format
  totalHours?: number;
}

export interface WorkStats {
  weeklyHours: number;
  dailyRecords: WorkRecord[];
  currentWeekStart: string;
}