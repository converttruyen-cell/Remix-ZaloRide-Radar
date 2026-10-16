import React, { useState } from 'react';
import { Trip, FilterRule } from '../types/trip';
import { TripParser } from '../services/tripParser';
import { GeminiService } from '../services/geminiService';
import { ClipboardPaste, Sparkles, Send, X, Check, AlertCircle } from 'lucide-react';

interface ManualPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: FilterRule[];
  onInjectTrip: (trip: Trip) => void;
}

export const ManualPasteModal: React.FC<ManualPasteModalProps> = ({
  isOpen,
  onClose,
  rules,
  onInjectTrip,
}) => {
  const [inputText, setInputText] = useState('');
  const [groupName, setGroupName] = useState('Hội Lái Xe Tiện Chuyến Zalo');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Trip | null>(null);

  if (!isOpen) return null;

  const handleLiveParse = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }
    const trip = TripParser.parseRawMessage(text, groupName);
    const matchResult = TripParser.matchTripWithRules(trip, rules);
    trip.isMatched = matchResult.isMatched;
    trip.matchedRules = matchResult.matchedRuleNames;
    setParsedPreview(trip);
  };

  const handleDeepAiParse = async () => {
    if (!inputText.trim()) return;
    setIsAiLoading(true);
    try {
      const trip = await GeminiService.parseWithGemini(inputText, groupName);
      const matchResult = TripParser.matchTripWithRules(trip, rules);
      trip.isMatched = matchResult.isMatched;
      trip.matchedRules = matchResult.matchedRuleNames;
      setParsedPreview(trip);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInject = () => {
    if (!parsedPreview) return;
    onInjectTrip(parsedPreview);
    setInputText('');
    setParsedPreview(null);
    onClose();
  };

  const sampleMessages = [
    'Cần xe 4c từ Nội Bài về Cầu Giấy 14h chiều nay 300k sđt 0987654321',
    'NB -> CG 4c 3 lốp 2h chèo ai ăn k 0968112233',
    'Tìm xe 7 chỗ Hải Phòng sang Giáp Bát 8h sáng mai khách bao xe 1.2tr lh 0912345678',
    'Khách ghép 1 người Vũng Tàu về Sân bay TSN đón 16h 250k đt 0978999888',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ClipboardPaste className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Dán Tin Nhắn Zalo Bóc Tách Tức Thì</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Sample quick paste chips */}
          <div>
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Bấm để thử tin nhắn mẫu:</div>
            <div className="flex flex-wrap gap-1.5">
              {sampleMessages.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLiveParse(msg)}
                  className="px-2 py-1 text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left truncate max-w-xs transition-colors"
                >
                  "{msg}"
                </button>
              ))}
            </div>
          </div>

          {/* Group input */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Nguồn nhóm Zalo</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Text Area */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Dán nội dung tin nhắn Zalo vào đây</label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => handleLiveParse(e.target.value)}
              placeholder="Ví dụ: Cần xe 4c từ Nội Bài về Cầu Giấy lúc 14h chiều nay 300k sđt 0987654321..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono"
            />
          </div>

          {/* Deep parse with AI button */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Bộ phân tích NLP xử lý tức thì viết tắt ("nb", "cg", "3 lốp", "1 củ", v.v.)
            </span>
            <button
              type="button"
              onClick={handleDeepAiParse}
              disabled={isAiLoading || !inputText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAiLoading ? 'AI đang đọc...' : 'Phân tích sâu với AI Gemini'}</span>
            </button>
          </div>

          {/* Live Extracted Preview */}
          {parsedPreview && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Kết Quả Bóc Tách Tự Động</span>
                </div>
                {parsedPreview.isMatched ? (
                  <span className="text-xs text-amber-400 font-semibold font-mono">
                    ★ Khớp: {parsedPreview.matchedRules.join(', ')}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Không khớp bộ lọc hiện tại
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Điểm đón:</span>
                  <span className="font-bold text-white">{parsedPreview.pickup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Điểm đến:</span>
                  <span className="font-bold text-white">{parsedPreview.destination}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Giá cước:</span>
                  <span className="font-bold text-amber-400 font-mono tabular-nums">
                    {parsedPreview.price !== null ? `${parsedPreview.price.toLocaleString('vi-VN')}đ` : parsedPreview.priceText}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Loại xe:</span>
                  <span className="font-medium text-slate-200">{parsedPreview.vehicleTypeLabel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Giờ đón:</span>
                  <span className="font-medium text-slate-200">{parsedPreview.pickupTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {parsedPreview.phoneNumber || 'Không tìm thấy'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Đóng
          </button>

          <button
            onClick={handleInject}
            disabled={!parsedPreview}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Đẩy Vào Luồng Quét & Phát Cảnh Báo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
