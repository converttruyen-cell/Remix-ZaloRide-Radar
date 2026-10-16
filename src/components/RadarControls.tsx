import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, PlusCircle, ClipboardPaste, Zap, Trash2, Webhook } from 'lucide-react';
import { NotificationSettings } from '../types/trip';

interface RadarControlsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  settings: NotificationSettings;
  onUpdateSettings: (settings: Partial<NotificationSettings>) => void;
  onSimulateSingle: () => void;
  onOpenPasteModal: () => void;
  onOpenWebhookModal: () => void;
  onClearTrips: () => void;
}

export const RadarControls: React.FC<RadarControlsProps> = ({
  speed,
  onSpeedChange,
  settings,
  onUpdateSettings,
  onSimulateSingle,
  onOpenPasteModal,
  onOpenWebhookModal,
  onClearTrips,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl mb-4">
      {/* Left: Speed selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Tốc độ quét:</span>
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            onClick={() => onSpeedChange(10000)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              speed === 10000
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chậm (10s)
          </button>
          <button
            onClick={() => onSpeedChange(5000)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              speed === 5000
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chuẩn (5s)
          </button>
          <button
            onClick={() => onSpeedChange(2000)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              speed === 2000
                ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bão đơn (2s)
          </button>
        </div>
      </div>

      {/* Middle: Quick audio & voice toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            settings.soundEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
          title="Bật/Tắt chuông cảnh báo cuốc mới"
        >
          {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="whitespace-nowrap">Âm chuông</span>
        </button>

        <button
          onClick={() => onUpdateSettings({ voiceEnabled: !settings.voiceEnabled })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            settings.voiceEnabled
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
          title="Bật/Tắt giọng đọc Tiếng Việt tự động khi có cuốc khớp tuyến"
        >
          {settings.voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span className="whitespace-nowrap">Giọng đọc VN</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSimulateSingle}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap"
          title="Bắn thử ngay 1 đơn mới vào luồng"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Bắn Đơn Thử</span>
        </button>

        <button
          onClick={onOpenPasteModal}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors whitespace-nowrap"
          title="Dán tin nhắn từ Zalo thực tế để bóc tách ngay"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span>Dán Tin Zalo</span>
        </button>

        <button
          onClick={onOpenWebhookModal}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors whitespace-nowrap"
          title="Xem hướng dẫn kết nối Webhook từ Zalo Bot / Extension"
        >
          <Webhook className="w-3.5 h-3.5 text-indigo-400" />
          <span>Webhook</span>
        </button>

        <button
          onClick={onClearTrips}
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Xoá lịch sử quét hiện tại"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
