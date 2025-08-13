export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as { standalone?: boolean }).standalone === true ||
         document.referrer.includes('android-app://');
}

export function isPWAInstalled(): boolean {
  return isStandalone();
}

export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !isPWAInstalled() && 
         'serviceWorker' in navigator && 
         'BeforeInstallPromptEvent' in window;
}

export function registerSW(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

export function unregisterSW(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister();
  });
}

export async function updateSW(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return true;
  } catch (error) {
    console.error('SW update failed:', error);
    return false;
  }
}

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

interface QueueAction {
  type: string;
  data: unknown;
  timestamp: number;
  id: string;
}

// 오프라인 데이터 동기화를 위한 큐 관리
export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueueAction[] = [];
  private isProcessing = false;

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  add(action: Omit<QueueAction, 'timestamp' | 'id'>): void {
    this.queue.push({
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36)
    });
    this.saveQueue();
    
    if (isOnline()) {
      this.processQueue();
    }
  }

  private saveQueue(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-offline-queue', JSON.stringify(this.queue));
    }
  }

  private loadQueue(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pwa-offline-queue');
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !isOnline()) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && isOnline()) {
      const action = this.queue.shift();
      if (!action) break;
      
      try {
        // 여기서 실제 동기화 로직 수행
        await this.processAction(action);
      } catch (error) {
        console.error('Queue processing failed:', error);
        // 실패한 액션을 다시 큐에 추가
        this.queue.unshift(action);
        break;
      }
    }
    
    this.isProcessing = false;
    this.saveQueue();
  }

  private async processAction(action: QueueAction): Promise<void> {
    // 실제 동기화 로직은 여기에 구현
    // 예: API 호출, 데이터베이스 업데이트 등
    console.log('Processing offline action:', action);
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

// 앱 초기화 시 오프라인 큐 복원
export function initializeOfflineQueue(): void {
  const queue = OfflineQueue.getInstance();
  
  // 온라인 상태 변경 감지
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      queue.processQueue();
    });
  }
}