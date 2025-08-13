'use client';

import AppLayout from '@/components/layout/AppLayout';
import { Wifi, WifiOff } from 'lucide-react';
import BlurCard from '@/components/ui/BlurCard';

export default function OfflinePage() {
  return (
    <AppLayout>
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        <BlurCard className="p-6 sm:p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full glass-effect flex items-center justify-center">
            <WifiOff color="#FF6B6B" size={32} />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-shadow-strong mb-4">
            오프라인 모드
          </h1>
          
          <p className="text-white/80 text-base sm:text-lg mb-6 leading-relaxed">
            인터넷 연결이 없습니다.<br />
            저장된 데이터는 계속 사용할 수 있습니다.
          </p>
          
          <div className="space-y-3 text-sm sm:text-base text-white/70">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>로컬 데이터 접근 가능</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>출퇴근 기록 및 조회</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>네트워크 복구 시 자동 동기화</span>
            </div>
          </div>
          
          <button 
            className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
            onClick={() => window.location.reload()}
          >
            <div className="flex items-center justify-center gap-2">
              <Wifi size={20} />
              <span>연결 다시 시도</span>
            </div>
          </button>
        </BlurCard>
      </div>
    </AppLayout>
  );
}