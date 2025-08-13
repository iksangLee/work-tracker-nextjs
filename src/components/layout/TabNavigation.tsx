'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Clock, BarChart3, Edit3 } from 'lucide-react';

export default function TabNavigation() {
  const pathname = usePathname();

  const tabs = [
    {
      name: '홈',
      href: '/',
      icon: Clock,
      color: '#007AFF'
    },
    {
      name: '통계',
      href: '/stats',
      icon: BarChart3,
      color: '#34D399'
    },
    {
      name: '기록',
      href: '/records',
      icon: Edit3,
      color: '#FF9500'
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[100]"
      role="tablist"
      aria-label="주요 네비게이션"
    >
      <div 
        className="border-t-0 shadow-lg"
        style={{
          backdropFilter: 'blur(100px)',
          WebkitBackdropFilter: 'blur(100px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          height: '88px',
          paddingTop: '8px',
          paddingBottom: '8px',
          paddingLeft: '8px',
          paddingRight: '8px'
        }}
      >
        <div className="flex justify-around items-center h-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center py-1 px-3 transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-lg flex-1 min-h-[44px] min-w-[44px]"
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.name} 페이지로 이동`}
                tabIndex={0}
              >
                <Icon 
                  size={24} 
                  color={isActive ? tab.color : 'rgba(60, 60, 67, 0.6)'} 
                  aria-hidden="true"
                />
                <span 
                  className="text-[11px] font-semibold mt-1 text-shadow"
                  style={{ 
                    color: isActive ? tab.color : 'rgba(60, 60, 67, 0.8)',
                    fontWeight: '600'
                  }}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}