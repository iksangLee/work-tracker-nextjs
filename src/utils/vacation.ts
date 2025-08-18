import { WorkType } from '@/types/work-record';

export interface VacationStyle {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  hours: number;
}

export function getVacationStyle(workType: WorkType): VacationStyle {
  switch (workType) {
    case 'annual_leave':
      return {
        label: '연차',
        bgColor: 'bg-green-400/20',
        borderColor: 'border-green-400/30',
        textColor: 'text-green-400',
        icon: '🏖️',
        hours: 8
      };
    case 'morning_half':
      return {
        label: '오전 반차',
        bgColor: 'bg-amber-400/20',
        borderColor: 'border-amber-400/30',
        textColor: 'text-amber-400',
        icon: '🌅',
        hours: 4
      };
    case 'afternoon_half':
      return {
        label: '오후 반차',
        bgColor: 'bg-orange-400/20',
        borderColor: 'border-orange-400/30',
        textColor: 'text-orange-400',
        icon: '🌆',
        hours: 4
      };
    case 'work':
    default:
      return {
        label: '일반 근무',
        bgColor: 'bg-blue-400/20',
        borderColor: 'border-blue-400/30',
        textColor: 'text-blue-400',
        icon: '💼',
        hours: 0 // 출퇴근 시간으로 계산
      };
  }
}

export function getVacationHours(workType: WorkType): number {
  return getVacationStyle(workType).hours;
}

export function isVacationType(workType: WorkType): boolean {
  return workType !== 'work';
}