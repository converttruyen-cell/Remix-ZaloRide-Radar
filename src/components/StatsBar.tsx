import React from 'react';
import { Activity, Target, CheckCircle2, DollarSign } from 'lucide-react';

interface StatsBarProps {
  totalTrips: number;
  matchedTrips: number;
  claimedTrips: number;
  totalEarnings: number;
  currentRate: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalTrips,
  matchedTrips,
  claimedTrips,
  totalEarnings,
  currentRate,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3.5 bg-slate-900/60 border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Cuốc Quét Hôm Nay</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-100 font-mono tabular-nums">
              {totalTrips}
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">{currentRate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Khớp Tuyến Bộ Lọc</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
              {matchedTrips}
            </span>
            <span className="text-[11px] text-slate-500">
              {totalTrips > 0 ? Math.round((matchedTrips / totalTrips) * 100) : 0}% tỉ lệ
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Đã Bắt / Nhận Kèo</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {claimedTrips}
            </span>
            <span className="text-[11px] text-slate-500">cuốc đã nhận</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Doanh Thu Dự Tính</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-100 font-mono tabular-nums">
              {totalEarnings > 0 ? (totalEarnings / 1000).toLocaleString('vi-VN') + 'k' : '0đ'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
