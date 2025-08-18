'use client';

import { Calendar, Coffee, Sunset, Sun } from 'lucide-react';
import { WorkType } from '@/types/work-record';
import BlurCard from './BlurCard';

interface VacationSelectorProps {
  selectedType: WorkType;
  onSelect: (type: WorkType) => void;
  className?: string;
}

export default function VacationSelector({ selectedType, onSelect, className = '' }: VacationSelectorProps) {
  const workTypes = [
    {
      type: 'work' as WorkType,
      label: '일반 근무',
      icon: <Coffee size={16} />,
      description: '출퇴근 시간 기록',
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400'
    },
    {
      type: 'annual_leave' as WorkType,
      label: '연차',
      icon: <Calendar size={16} />,
      description: '8시간 자동 인정',
      color: 'green',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-400'
    },
    {
      type: 'morning_half' as WorkType,
      label: '오전 반차',
      icon: <Sun size={16} />,
      description: '4시간 자동 인정',
      color: 'amber',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-400'
    },
    {
      type: 'afternoon_half' as WorkType,
      label: '오후 반차',
      icon: <Sunset size={16} />,
      description: '4시간 자동 인정',
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-white font-medium text-sm mb-3">근무 타입 선택</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {workTypes.map((workType) => (
          <button
            key={workType.type}
            onClick={() => onSelect(workType.type)}
            className="text-left transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-xl"
          >
            <BlurCard 
              intensity="light" 
              className={`p-3 border-2 ${
                selectedType === workType.type 
                  ? `${workType.bgColor} ${workType.borderColor} ring-2 ring-white/30` 
                  : 'border-white/20 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={selectedType === workType.type ? workType.textColor : 'text-white/70'}>
                  {workType.icon}
                </div>
                <span className={`font-medium text-xs ${
                  selectedType === workType.type ? workType.textColor : 'text-white'
                }`}>
                  {workType.label}
                </span>
              </div>
              <p className={`text-xs leading-tight ${
                selectedType === workType.type ? 'text-white/90' : 'text-white/60'
              }`}>
                {workType.description}
              </p>
            </BlurCard>
          </button>
        ))}
      </div>
    </div>
  );
}