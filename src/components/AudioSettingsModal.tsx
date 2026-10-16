import React, { useState } from 'react';
import { NotificationSettings } from '../types/trip';
import { soundService } from '../services/soundService';
import { Bell, Volume2, Mic, Play, Check, ShieldCheck, X } from 'lucide-react';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [permissionState, setPermissionState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const handleTestSound = (type: NotificationSettings['soundType']) => {
    soundService.playAlertSound(type, localSettings.soundVolume);
  };

  const handleTestVoice = () => {
    soundService.speakVietnameseTrip('Nội Bài', 'Cầu Giấy', 'ba trăm nghìn đồng', localSettings.voiceRate);
  };

  const handleRequestDesktopPermission = async () => {
    const granted = await soundService.requestNotificationPermission();
    setPermissionState(granted ? 'granted' : 'denied');
    setLocalSettings(prev => ({ ...prev, browserNotificationEnabled: granted }));
    if (granted) {
      soundService.sendDesktopNotification('ZaloRide Radar', 'Thông báo desktop đã được kích hoạt thành công!');
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Cài Đặt Cảnh Báo Âm Thanh & Giọng Đọc</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Sound Alert Section */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">Âm Thanh Báo Cuốc Mới (Web Audio)</div>
                  <div className="text-[11px] text-slate-400">Phát âm thanh tức thì khi có cuốc khớp bộ lọc của bạn</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocalSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  localSettings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    localSettings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {localSettings.soundEnabled && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5">Kiểu âm chuông cảnh báo:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'chime', label: 'Chuông kép thanh lịch' },
                      { id: 'radar', label: 'Sonar Radar Ping' },
                      { id: 'double_beep', label: 'Bíp kép khẩn cấp' },
                      { id: 'bell', label: 'Chuông Taxi vang' },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          localSettings.soundType === item.id
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                        onClick={() => setLocalSettings(s => ({ ...s, soundType: item.id as NotificationSettings['soundType'] }))}
                      >
                        <span className="font-medium">{item.label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSound(item.id as NotificationSettings['soundType']);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-400 rounded"
                          title="Nghe thử âm này"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Âm lượng chuông</span>
                    <span className="font-mono tabular-nums">{Math.round(localSettings.soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={localSettings.soundVolume}
                    onChange={(e) => setLocalSettings(s => ({ ...s, soundVolume: parseFloat(e.target.value) }))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Voice Text-To-Speech Section */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">Giọng Đọc Tiếng Việt Tự Động (TTS)</div>
                  <div className="text-[11px] text-slate-400">Tự động đọc to: "Cuốc mới: Nội Bài về Cầu Giấy, ba trăm nghìn"</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocalSettings(s => ({ ...s, voiceEnabled: !s.voiceEnabled }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  localSettings.voiceEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                    localSettings.voiceEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {localSettings.voiceEnabled && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Kiểm tra giọng đọc tiếng Việt của thiết bị:</span>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Đọc Thử Câu Mẫu</span>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Tốc độ đọc giọng nói</span>
                    <span className="font-mono tabular-nums">{localSettings.voiceRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.05"
                    value={localSettings.voiceRate}
                    onChange={(e) => setLocalSettings(s => ({ ...s, voiceRate: parseFloat(e.target.value) }))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Push Notification Section */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs font-bold text-white">Thông Báo Đẩy Desktop (Browser Push)</div>
                  <div className="text-[11px] text-slate-400">Hiện banner thông báo nổi trên góc màn hình máy tính / điện thoại</div>
                </div>
              </div>

              {permissionState === 'granted' ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã cấp quyền
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestDesktopPermission}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  Cấp Quyền
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Huỷ
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};
