import { WorkRecord } from '@/types/work-record';
import { storage, STORAGE_KEY } from './storage';

// 백업 데이터 타입
interface BackupData {
  records: WorkRecord[];
  backupDate: string;
  version: string;
  appName: string;
}

// JSON 백업 파일 생성 및 다운로드
export async function exportToJSON(): Promise<void> {
  try {
    const storedData = await storage.getItem(STORAGE_KEY);
    const records: WorkRecord[] = storedData ? JSON.parse(storedData) : [];
    
    const backupData: BackupData = {
      records,
      backupDate: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Seoul'
      }),
      version: '1.0.0',
      appName: 'Work Tracker PWA'
    };
    
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'Asia/Seoul'
    }).replace(/\./g, '-').replace(/ /g, '');
    link.download = `work-tracker-backup-${today}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('JSON 내보내기 실패:', error);
    throw new Error('백업 파일 생성에 실패했습니다.');
  }
}

// JSON 파일 불러오기
export function importFromJSON(): Promise<WorkRecord[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('파일이 선택되지 않았습니다.'));
        return;
      }
      
      try {
        const text = await file.text();
        const backupData = validateBackup(text);
        
        if (!backupData) {
          reject(new Error('잘못된 백업 파일입니다.'));
          return;
        }
        
        // localStorage에 복원
        await storage.setItem(STORAGE_KEY, JSON.stringify(backupData.records));
        resolve(backupData.records);
        
      } catch (error) {
        console.error('파일 읽기 실패:', error);
        reject(new Error('파일을 읽을 수 없습니다.'));
      }
    };
    
    input.click();
  });
}

// 백업 파일 검증
export function validateBackup(backupText: string): BackupData | null {
  try {
    const backupData = JSON.parse(backupText);
    
    // 필수 필드 확인
    if (!backupData.records || !Array.isArray(backupData.records)) {
      throw new Error('잘못된 백업 형식: records 필드 누락');
    }
    
    // 각 레코드 형식 검증
    for (const record of backupData.records) {
      if (!record.id || !record.date) {
        throw new Error('잘못된 레코드 형식: id 또는 date 필드 누락');
      }
      
      // 시간 형식 검증 (선택적)
      if (record.clockIn && !/^\d{2}:\d{2}$/.test(record.clockIn)) {
        throw new Error('잘못된 출근 시간 형식');
      }
      
      if (record.clockOut && !/^\d{2}:\d{2}$/.test(record.clockOut)) {
        throw new Error('잘못된 퇴근 시간 형식');
      }
    }
    
    return backupData;
  } catch (error) {
    console.error('백업 검증 실패:', error);
    return null;
  }
}

// 자동 백업 (로컬 저장)
export async function createAutoBackup(): Promise<void> {
  try {
    const storedData = await storage.getItem(STORAGE_KEY);
    const records: WorkRecord[] = storedData ? JSON.parse(storedData) : [];
    
    const backupData: BackupData = {
      records,
      backupDate: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Seoul'
      }),
      version: '1.0.0',
      appName: 'Work Tracker PWA'
    };
    
    const autoBackupKey = `${STORAGE_KEY}_auto_backup`;
    await storage.setItem(autoBackupKey, JSON.stringify(backupData));
    
    // 백업 생성 시간 저장
    const lastBackupKey = `${STORAGE_KEY}_last_backup`;
    await storage.setItem(lastBackupKey, new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Seoul'
    }));
  } catch (error) {
    console.error('자동 백업 실패:', error);
  }
}