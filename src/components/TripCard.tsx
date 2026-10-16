import React, { useState } from 'react';
import { Trip, QuickTemplate } from '../types/trip';
import { Phone, MessageSquare, Copy, Check, MapPin, Clock, Car, ChevronDown, ChevronUp, AlertCircle, BookmarkCheck } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onClaimTrip: (trip: Trip) => void;
  quickTemplates: QuickTemplate[];
  onCopyTemplate: (text: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onClaimTrip,
  quickTemplates,
  onCopyTemplate,
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Time elapsed formatter
  const elapsedSec = Math.floor((Date.now() - trip.timestamp) / 1000);
  let timeAgo = 'Vừa xong';
  if (elapsedSec > 60) {
    const min = Math.floor(elapsedSec / 60);
    timeAgo = `${min} phút trước`;
  } else if (elapsedSec > 5) {
    timeAgo = `${elapsedSec} giây trước`;
  }

  // Format price
  const displayPrice = trip.price !== null
    ? `${trip.price.toLocaleString('vi-VN')}đ`
    : trip.priceText;

  // Format template with trip parameters
  const generateMessage = (templateContent: string) => {
    return templateContent
      .replace('{vehicle}', trip.vehicleTypeLabel)
      .replace('{pickup}', trip.pickup)
      .replace('{destination}', trip.destination)
      .replace('{price}', displayPrice);
  };

  const handleQuickCopy = (template?: QuickTemplate) => {
    const tpl = template || quickTemplates[0];
    const text = tpl
      ? generateMessage(tpl.content)
      : `Em nhận cuốc ${trip.pickup} -> ${trip.destination} giá ${displayPrice} nhé sếp ơi!`;
    onCopyTemplate(text);
    setCopied(true);
    setShowTemplateDropdown(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        trip.isMatched
          ? 'bg-slate-900 border-amber-500/40 shadow-sm shadow-amber-500/5'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* 1. Header Metadata: unboxed clean text with typographic separators */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mb-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2 truncate">
          <span className="font-medium text-slate-300 truncate max-w-[200px]">
            {trip.sourceGroup}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono tabular-nums">{timeAgo}</span>

          {trip.isMatched && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                ★ Khớp: {trip.matchedRules.join(', ') || 'Tuyến đã lưu'}
              </span>
            </>
          )}

          {trip.isUrgent && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Cần gấp
              </span>
            </>
          )}
        </div>

        {trip.status === 'claimed' && (
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 shrink-0 font-mono">
            <BookmarkCheck className="w-3.5 h-3.5" /> Đã nhận
          </span>
        )}
      </div>

      {/* 2. Route Section: High legibility Departure & Destination */}
      <div className="relative pl-6 space-y-2 mb-3.5">
        {/* Route connector line */}
        <div className="absolute left-[7px] top-[10px] bottom-[10px] w-0.5 border-l-2 border-dashed border-slate-700" />

        {/* Departure */}
        <div className="relative flex items-baseline justify-between gap-3">
          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500/20 border-2 border-emerald-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[11px] text-slate-400 font-medium">Điểm đón</div>
            <div className="text-sm font-bold text-slate-100">{trip.pickup}</div>
          </div>
        </div>

        {/* Destination */}
        <div className="relative flex items-baseline justify-between gap-3">
          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-rose-500/20 border-2 border-rose-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[11px] text-slate-400 font-medium">Điểm đến</div>
            <div className="text-sm font-bold text-slate-100">{trip.destination}</div>
          </div>
        </div>
      </div>

      {/* 3. Specs Bar: Price, Vehicle Type, Time, Phone */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs mb-3">
        <div>
          <div className="text-[11px] text-slate-400">Giá cước</div>
          <div className="text-sm font-bold text-amber-400 font-mono tabular-nums">
            {displayPrice}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Car className="w-3 h-3 text-slate-400" />
            <span>Loại xe</span>
          </div>
          <div className="font-semibold text-slate-200 truncate">
            {trip.vehicleTypeLabel}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Giờ đón</span>
          </div>
          <div className="font-medium text-slate-300 truncate">
            {trip.pickupTime}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>Liên hệ</span>
          </div>
          <div className="font-mono font-semibold text-slate-200 tabular-nums">
            {trip.phoneNumber || 'Inbox Zalo'}
          </div>
        </div>
      </div>

      {/* Notes if present */}
      {trip.notes && (
        <div className="text-xs text-slate-400 italic mb-3">
          Ghi chú: {trip.notes}
        </div>
      )}

      {/* Raw message toggle */}
      <div className="mb-3">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{showRaw ? 'Ẩn tin nhắn gốc' : 'Xem tin nhắn gốc từ Zalo'}</span>
        </button>
        {showRaw && (
          <div className="mt-1.5 p-2.5 bg-slate-950 rounded-lg text-xs text-slate-300 font-mono whitespace-pre-wrap border border-slate-800">
            "{trip.rawText}"
          </div>
        )}
      </div>

      {/* 4. Quick Sniper Action Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
        {/* Call phone button */}
        {trip.phoneNumber ? (
          <a
            href={`tel:${trip.phoneNumber}`}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Gọi {trip.phoneNumber}</span>
          </a>
        ) : (
          <button
            disabled
            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 text-slate-500 rounded-lg text-xs font-medium cursor-not-allowed whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Không có SĐT</span>
          </button>
        )}

        {/* Zalo chat */}
        {trip.phoneNumber && (
          <a
            href={`https://zalo.me/${trip.phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Zalo</span>
          </a>
        )}

        {/* Quick copy template reply */}
        <div className="relative">
          <button
            onClick={() => handleQuickCopy()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
            title="Sao chép tin nhắn chốt kèo nhanh vào clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép!' : 'Chép mẫu chốt'}</span>
          </button>
        </div>

        {/* Claim trip / Nhận cuốc button */}
        {trip.status !== 'claimed' ? (
          <button
            onClick={() => onClaimTrip(trip)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Nhận Cuốc Này</span>
          </button>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-medium cursor-default whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Đã Vào Sổ Cuốc</span>
          </button>
        )}
      </div>
    </div>
  );
};
