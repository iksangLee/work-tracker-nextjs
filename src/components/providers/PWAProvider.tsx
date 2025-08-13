'use client';

import { ReactNode, useEffect } from 'react';
import { registerSW, initializeOfflineQueue } from '@/utils/pwa';

interface PWAProviderProps {
  children: ReactNode;
}

export default function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    // Service Worker 등록
    registerSW();
    
    // 오프라인 큐 초기화
    initializeOfflineQueue();
    
    // PWA 업데이트 확인
    const checkForUpdates = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    };
    
    // 앱이 포커스를 받을 때 업데이트 확인
    window.addEventListener('focus', checkForUpdates);
    
    // 페이지 가시성 변경 시 업데이트 확인
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    });
    
    return () => {
      window.removeEventListener('focus', checkForUpdates);
      document.removeEventListener('visibilitychange', checkForUpdates);
    };
  }, []);

  return <>{children}</>;
}