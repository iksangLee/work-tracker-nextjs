'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // iOS 기기 감지
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // iOS나 이미 설치된 상태가 아닌 경우에만 프롬프트 표시
    if (!window.matchMedia('(display-mode: standalone)').matches && 
        !localStorage.getItem('installPromptDismissed')) {
      if (iOS) {
        // iOS는 beforeinstallprompt 이벤트가 없으므로 바로 표시
        setShowPrompt(true);
      } else {
        window.addEventListener('beforeinstallprompt', handler);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS는 수동 설치 안내만 가능
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA 설치됨');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[120] px-4">
      <div className="p-4 border border-blue-400/30 bg-blue-600/90 backdrop-blur-xl rounded-2xl shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            {isIOS ? <Share color="#FFFFFF" size={20} /> : <Download color="#FFFFFF" size={20} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1 text-shadow-strong">
              {isIOS ? '홈 화면에 추가' : '앱 설치하기'}
            </h3>
            <p className="text-white text-xs leading-relaxed mb-3 text-shadow">
              {isIOS 
                ? 'Safari 하단의 공유 버튼 → "홈 화면에 추가"를 선택하세요' 
                : '홈 화면에 추가하여 더 빠르고 편리하게 사용하세요'
              }
            </p>
            
            {!isIOS && (
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  설치
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  나중에
                </button>
              </div>
            )}
            
            {isIOS && (
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
              >
                확인
              </button>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <X color="rgba(255, 255, 255, 0.6)" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}