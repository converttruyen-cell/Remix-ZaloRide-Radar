import React from 'react';
import { Search, SlidersHorizontal, CheckSquare, Square } from 'lucide-react';

interface FilterBarProps {
  activeView: 'all' | 'matched_only' | 'airport' | '4cho' | '7cho' | 'long_trip';
  setActiveView: (view: 'all' | 'matched_only' | 'airport' | '4cho' | '7cho' | 'long_trip') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onlyWithPhone: boolean;
  setOnlyWithPhone: (val: boolean) => void;
  matchedCount: number;
  totalCount: number;
  onOpenFilterManager: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  onlyWithPhone,
  setOnlyWithPhone,
  matchedCount,
  totalCount,
  onOpenFilterManager,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Segmented filter controls (functional button tabs) */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveView('matched_only')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'matched_only'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <span>⭐ Khớp Bộ Lọc Của Tôi</span>
            <span className="font-mono tabular-nums text-[11px] opacity-90">({matchedCount})</span>
          </button>

          <button
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'all'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất Cả ({totalCount})
          </button>

          <button
            onClick={() => setActiveView('airport')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'airport'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sân Bay (Nội Bài / TSN)
          </button>

          <button
            onClick={() => setActiveView('4cho')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === '4cho'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Xe 4 Chỗ
          </button>

          <button
            onClick={() => setActiveView('7cho')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === '7cho'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Xe 7 Chỗ
          </button>

          <button
            onClick={() => setActiveView('long_trip')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'long_trip'
                ? 'bg-slate-800 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Liên Tỉnh / Bao Xe
          </button>
        </div>

        {/* Right side config button */}
        <button
          onClick={onOpenFilterManager}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Tuỳ Chỉnh Bộ Lọc</span>
        </button>
      </div>

      {/* Search and toggle bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhanh: Cầu Giấy, Hải Phòng, 300k, SĐT..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => setOnlyWithPhone(!onlyWithPhone)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            onlyWithPhone
              ? 'bg-slate-900 border-amber-500/40 text-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          {onlyWithPhone ? (
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-600" />
          )}
          <span>Chỉ xem tin có SĐT</span>
        </button>
      </div>
    </div>
  );
};
