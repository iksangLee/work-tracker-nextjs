import { ReactNode } from 'react';
import TabNavigation from './TabNavigation';
import NetworkStatus from '@/components/ui/NetworkStatus';
import SkipLink from '@/components/ui/SkipLink';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <SkipLink />
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(88, 86, 214, 0.1) 50%, rgba(255, 45, 85, 0.05) 100%)'
        }}
      />
      
      {/* Network Status */}
      <NetworkStatus />
      
      {/* Content */}
      <main 
        id="main-content"
        className="relative z-10 pb-[88px] overflow-y-auto max-h-screen"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
      
      {/* Tab Navigation */}
      <TabNavigation />
    </div>
  );
}