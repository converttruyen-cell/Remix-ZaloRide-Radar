import React, { useState } from 'react';
import { Trip } from '../types/trip';
import { Phone, CheckCircle, Clock, MapPin, DollarSign, Trash2, ArrowRight, Car, MessageSquare, AlertCircle } from 'lucide-react';

interface ClaimedTripsViewProps {
  claimedTrips: Trip[];
  onUpdateTripStatus: (tripId: string, newStatus: Trip['status']) => void;
  onRemoveClaimedTrip: (tripId: string) => void;
  onClearAllClaimed: () => void;
}

export const ClaimedTripsView: React.FC<ClaimedTripsViewProps> = ({
  claimedTrips,
  onUpdateTripStatus,
  onRemoveClaimedTrip,
  onClearAllClaimed,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'claimed' | 'in_progress' | 'completed'>('all');

  const filtered = claimedTrips.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const totalRevenue = claimedTrips
    .filter(t => t.status === 'completed' || t.status === 'in_progress' || t.status === 'claimed')
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const completedCount = claimedTrips.filter(t => t.status === 'completed').length;
  const inProgressCount = claimedTrips.filter(t => t.status === 'in_progress' || t.status === 'claimed').length;

  return (
    <div className="space-y-6">
      {/* Top Driver Profile & Ledger Summary */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/driver_avatar_1792142510524.jpg"
            alt="Ảnh tài xế"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Sổ Kèo & Cuốc Đã Nhận</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                Tài Xế Hoạt Động
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Quản lý các cuốc xe đã chốt từ Zalo, theo dõi tiến độ đón trả và thu nhập thực tế.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/80 px-5 py-3 rounded-xl w-full md:w-auto justify-between md:justify-end">
          <div>
            <div className="text-xs text-slate-400">Doanh thu dự tính</div>
            <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              {(totalRevenue / 1000).toLocaleString('vi-VN')}k <span className="text-xs text-slate-400 font-sans">VNĐ</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400">Đang chạy / Xong</div>
            <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              {inProgressCount} <span className="text-xs text-slate-400 font-sans">/ {completedCount} xong</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({claimedTrips.length})
          </button>
          <button
            onClick={() => setFilterStatus('claimed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'claimed' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mới nhận ({claimedTrips.filter(t => t.status === 'claimed').length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'in_progress' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đang đón / Chạy ({claimedTrips.filter(t => t.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'completed' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hoàn thành ({completedCount})
          </button>
        </div>

        {claimedTrips.length > 0 && (
          <button
            onClick={onClearAllClaimed}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xoá tất cả cuốc đã xong</span>
          </button>
        )}
      </div>

      {/* Claimed Trips List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <Car className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Chưa có cuốc nào trong danh sách này</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Khi xem các đơn mới trên Radar Quét, bạn có thể bấm nút "Nhận Cuốc Này" để lưu ngay vào sổ theo dõi chuyến đi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((trip) => (
            <div
              key={trip.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{trip.sourceGroup}</span>
                  <span>·</span>
                  <span>{trip.vehicleTypeLabel}</span>
                  <span>·</span>
                  <span className="text-slate-500">Giờ đón: {trip.pickupTime}</span>
                </div>

                {/* Status Badge & Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Trạng thái:</span>
                  <select
                    value={trip.status}
                    onChange={(e) => onUpdateTripStatus(trip.id, e.target.value as Trip['status'])}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="claimed">⏳ Đã nhận cuốc</option>
                    <option value="in_progress">🚗 Đang đón / Đang chạy</option>
                    <option value="completed">✅ Hoàn thành chuyến</option>
                    <option value="cancelled">❌ Đã huỷ</option>
                  </select>

                  <button
                    onClick={() => onRemoveClaimedTrip(trip.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                    title="Xoá khỏi sổ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400">Đón tại</div>
                    <div className="text-sm font-bold text-white">{trip.pickup}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400">Trả tại</div>
                    <div className="text-sm font-bold text-white">{trip.destination}</div>
                  </div>
                </div>
              </div>

              {/* Actions & Price */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-400">Giá thu khách:</div>
                  <div className="text-base font-bold text-amber-400 font-mono tabular-nums">
                    {trip.price !== null ? `${trip.price.toLocaleString('vi-VN')}đ` : trip.priceText}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {trip.phoneNumber && (
                    <>
                      <a
                        href={`tel:${trip.phoneNumber}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi: {trip.phoneNumber}</span>
                      </a>
                      <a
                        href={`https://zalo.me/${trip.phoneNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Zalo</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
