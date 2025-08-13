export interface WorkRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  clockIn?: string; // HH:MM format
  clockOut?: string; // HH:MM format
  totalHours?: number;
}

export interface WorkStats {
  weeklyHours: number;
  dailyRecords: WorkRecord[];
  currentWeekStart: string;
}