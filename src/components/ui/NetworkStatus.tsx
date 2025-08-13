'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowStatus(true);
      } else {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    };

    setIsOnline(navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[120] transition-all duration-300 ${
      showStatus ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
    }`}>
      <div 
        className={`px-4 py-2 rounded-full backdrop-blur-md border flex items-center gap-2 text-sm font-medium text-shadow-strong ${
          isOnline 
            ? 'bg-green-500/20 border-green-400/30 text-green-400' 
            : 'bg-red-500/20 border-red-400/30 text-red-400'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi size={16} />
            <span>온라인</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>오프라인</span>
          </>
        )}
      </div>
    </div>
  );
}