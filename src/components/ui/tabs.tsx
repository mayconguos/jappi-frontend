'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  tabHeaderClassName?: string;
  tabContentClassName?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  className = '',
  tabHeaderClassName = '',
  tabContentClassName = '',
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Tab Headers */}
      <div className={clsx('flex border-b border-gray-200 bg-gray-50', tabHeaderClassName)}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2',
                activeTab === tab.id
                  ? 'text-[var(--surface-dark)] border-[var(--surface-dark)] bg-white'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {Icon && <Icon size={18} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={clsx('p-6', tabContentClassName)}>
        {activeTabContent}
      </div>
    </div>
  );
};

// Hook personalizado para manejar tabs externamente si es necesario
export const useTabs = (initialTab?: string) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab || '');

  return {
    activeTab,
    setActiveTab
  };
};

export default Tabs;