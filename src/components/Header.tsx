import React from 'react';
import { Radio, Bell, ListFilter, CheckCircle, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentTab: 'radar' | 'filters' | 'claimed' | 'groups' | 'settings';
  setCurrentTab: (tab: 'radar' | 'filters' | 'claimed' | 'groups' | 'settings') => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  activeRulesCount: number;
  claimedCount: number;
  activeGroupsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isStreaming,
  onToggleStreaming,
  activeRulesCount,
  claimedCount,
  activeGroupsCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark with icon */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          ZaloRide Radar
        </span>
      </div>

      {/* Zone 2: 4-5 single-line clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <button
          onClick={() => setCurrentTab('radar')}
          className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
            currentTab === 'radar'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Radar Quét Đơn</span>
        </button>

        <button
          onClick={() => setCurrentTab('filters')}
          className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
            currentTab === 'filters'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Bộ Lọc Tuyến</span>
          <span className="text-xs text-slate-500 tabular-nums">({activeRulesCount})</span>
        </button>

        <button
          onClick={() => setCurrentTab('claimed')}
          className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
            currentTab === 'claimed'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Cuốc Đã Nhận</span>
          {claimedCount > 0 && (
            <span className="text-xs px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-mono rounded">
              {claimedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('groups')}
          className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
            currentTab === 'groups'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Nhóm Zalo</span>
          <span className="text-xs text-slate-500 tabular-nums">({activeGroupsCount})</span>
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
            currentTab === 'settings'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Âm Báo & Giọng Đọc</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleStreaming}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 shadow-sm ${
            isStreaming
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isStreaming ? 'bg-emerald-300 animate-ping' : 'bg-slate-500'
            }`}
          />
          <span>{isStreaming ? 'Đang Quét Đơn (Bật)' : 'Tạm Dừng Quét'}</span>
        </button>
      </div>
    </header>
  );
};
