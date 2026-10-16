import React, { useState } from 'react';
import { Trip, FilterRule } from '../types/trip';
import { TripParser } from '../services/tripParser';
import { Webhook, Copy, Check, Terminal, Play, X, Code2 } from 'lucide-react';

interface WebhookInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: FilterRule[];
  onInjectTrip: (trip: Trip) => void;
}

export const WebhookInfoModal: React.FC<WebhookInfoModalProps> = ({
  isOpen,
  onClose,
  rules,
  onInjectTrip,
}) => {
  const [copied, setCopied] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://zaloride-radar.app';
  const webhookUrl = `${currentDomain}/api/zalo-webhook`;

  const samplePayload = {
    groupName: "Hội Xe Tiện Chuyến Hà Nội - Miền Bắc",
    senderName: "Bác Tài Điều Hành",
    message: "Cần xe 7 chỗ Fortuner từ Sân bay Nội Bài về Cầu Giấy 15h30 chiều nay, giá 350k sđt 0988554433",
    timestamp: Date.now()
  };

  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload)}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestWebhook = () => {
    const trip = TripParser.parseRawMessage(samplePayload.message, samplePayload.groupName);
    const matchResult = TripParser.matchTripWithRules(trip, rules);
    trip.isMatched = matchResult.isMatched;
    trip.matchedRules = matchResult.matchedRuleNames;
    onInjectTrip(trip);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Webhook className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Kết Nối Webhook Tự Động Từ Zalo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <p className="text-xs text-slate-300 leading-relaxed">
            Bạn có thể kết nối bất kỳ Extension trình duyệt, Bot Zalo hoặc công cụ tự động hóa (Zalo Web scraper) để đẩy tin nhắn các nhóm Zalo về ứng dụng này theo thời gian thực.
          </p>

          {/* Webhook endpoint URL */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400">Endpoint Webhook tiếp nhận POST:</div>
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-amber-400 break-all">
              <span>{webhookUrl}</span>
              <button
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
                className="p-1 text-slate-400 hover:text-white shrink-0"
                title="Sao chép URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* cURL example */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Mã mẫu cURL gửi tin nhắn:</span>
              </span>
              <button
                onClick={handleCopyCurl}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
              {curlExample}
            </pre>
          </div>

          {/* Test simulation button */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-white">Thử nghiệm Webhook giả lập</div>
              <div className="text-[11px] text-slate-400">
                Gửi ngay 1 gói tin giả lập qua cổng tiếp nhận để kiểm tra phản hồi âm thanh & lọc tuyến
              </div>
            </div>

            <button
              onClick={handleSendTestWebhook}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
            >
              {testSent ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Play className="w-3.5 h-3.5" />}
              <span>{testSent ? 'Đã Bắn Đơn!' : 'Bắn Thử Webhook'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
