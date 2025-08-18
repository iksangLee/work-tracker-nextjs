'use client';

import { useState } from 'react';
import { Download, Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { exportToJSON, importFromJSON } from '@/utils/backup';
import { useQueryClient } from '@tanstack/react-query';
import BlurCard from './BlurCard';
import GradientButton from './GradientButton';

interface BackupManagerProps {
  onClose?: () => void;
}

export default function BackupManager({ onClose }: BackupManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const queryClient = useQueryClient();

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await exportToJSON();
      setMessage({ type: 'success', text: '백업 파일을 성공적으로 다운로드했습니다!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '백업 실패' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await importFromJSON();
      
      // React Query 캐시 새로고침
      queryClient.invalidateQueries({ queryKey: ['work-records'] });
      
      setMessage({ type: 'success', text: '백업 파일을 성공적으로 복원했습니다!' });
      
      // 3초 후 자동으로 닫기
      setTimeout(() => {
        onClose?.();
      }, 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '복원 실패' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[120]">
      <BlurCard intensity="strong" className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save size={32} color="#007AFF" />
          </div>
          <h2 className="text-2xl font-bold text-white text-shadow-ultra mb-2">
            데이터 백업
          </h2>
          <p className="text-white/80 text-shadow-strong">
            근무 기록을 안전하게 백업하고 복원하세요
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <GradientButton
            variant="primary"
            onClick={handleExport}
            disabled={isLoading}
            className="w-full min-h-[52px] text-lg font-bold"
          >
            <Download size={20} />
            <span>백업 파일 다운로드</span>
          </GradientButton>

          <GradientButton
            variant="secondary"
            onClick={handleImport}
            disabled={isLoading}
            className="w-full min-h-[52px] text-lg font-bold"
          >
            <Upload size={20} />
            <span>백업 파일 불러오기</span>
          </GradientButton>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <BlurCard 
            intensity="light" 
            className={`p-4 mb-4 border ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30' 
                : 'bg-red-500/20 border-red-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type === 'success' ? (
                <CheckCircle size={20} color="#10B981" className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} color="#EF4444" className="flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {message.text}
              </p>
            </div>
          </BlurCard>
        )}

        {/* 설명 */}
        <BlurCard intensity="light" className="p-4 mb-6">
          <div className="text-sm text-white/70 space-y-2">
            <p>• <strong className="text-white">백업 다운로드:</strong> JSON 파일로 모든 근무 기록 저장</p>
            <p>• <strong className="text-white">백업 불러오기:</strong> 저장된 JSON 파일에서 데이터 복원</p>
            <p>• <strong className="text-white">주의:</strong> 불러오기 시 기존 데이터가 덮어써집니다</p>
          </div>
        </BlurCard>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-full py-3 text-white/70 hover:text-white transition-colors disabled:opacity-50"
        >
          닫기
        </button>
      </BlurCard>
    </div>
  );
}