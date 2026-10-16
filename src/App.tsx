/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trip, FilterRule, ZaloGroup, NotificationSettings, QuickTemplate } from './types/trip';
import { StorageService } from './services/storageService';
import { TripParser } from './services/tripParser';
import { soundService } from './services/soundService';
import { MOCK_RAW_ZALO_MESSAGES } from './services/mockZaloData';

import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { RadarControls } from './components/RadarControls';
import { FilterBar } from './components/FilterBar';
import { TripCard } from './components/TripCard';
import { ClaimedTripsView } from './components/ClaimedTripsView';
import { FilterManagerModal } from './components/FilterManagerModal';
import { ZaloGroupsModal } from './components/ZaloGroupsModal';
import { ManualPasteModal } from './components/ManualPasteModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { WebhookInfoModal } from './components/WebhookInfoModal';

import { 
  Radio, 
  ListFilter, 
  CheckCircle2, 
  SlidersHorizontal, 
  MessageSquare, 
  ShieldCheck, 
  Flame, 
  MapPin, 
  Car,
  Bell,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

export default function App() {
  // 1. Persistent State
  const [rules, setRules] = useState<FilterRule[]>(() => StorageService.getRules());
  const [groups, setGroups] = useState<ZaloGroup[]>(() => StorageService.getGroups());
  const [settings, setSettings] = useState<NotificationSettings>(() => StorageService.getSettings());
  const [templates, setTemplates] = useState<QuickTemplate[]>(() => StorageService.getTemplates());
  const [claimedTrips, setClaimedTrips] = useState<Trip[]>(() => StorageService.getClaimedTrips());

  // 2. Stream State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(5000); // 5s interval default
  const mockIndexRef = useRef<number>(0);

  // 3. Navigation & Filtering State
  const [currentTab, setCurrentTab] = useState<'radar' | 'filters' | 'claimed' | 'groups' | 'settings'>('radar');
  const [activeView, setActiveView] = useState<'all' | 'matched_only' | 'airport' | '4cho' | '7cho' | 'long_trip'>('matched_only');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyWithPhone, setOnlyWithPhone] = useState<boolean>(false);

  // 4. Modals State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // 5. Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to local storage
  const handleSaveRules = (newRules: FilterRule[]) => {
    setRules(newRules);
    StorageService.saveRules(newRules);
    showToast('Đã lưu cấu hình bộ lọc');
  };

  const handleSaveGroups = (newGroups: ZaloGroup[]) => {
    setGroups(newGroups);
    StorageService.saveGroups(newGroups);
    showToast('Đã cập nhật danh sách nhóm Zalo');
  };

  const handleSaveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    showToast('Đã lưu cài đặt âm thanh cảnh báo');
  };

  const handleSaveClaimedTrips = (newClaimed: Trip[]) => {
    setClaimedTrips(newClaimed);
    StorageService.saveClaimedTrips(newClaimed);
  };

  // Handle Ingesting a new Trip into the live stream
  const ingestTrip = (newTrip: Trip) => {
    // Check matching against rules
    const matchResult = TripParser.matchTripWithRules(newTrip, rules);
    newTrip.isMatched = matchResult.isMatched;
    newTrip.matchedRules = matchResult.matchedRuleNames;

    // Trigger notifications if matched
    if (newTrip.isMatched) {
      if (settings.soundEnabled) {
        soundService.playAlertSound(settings.soundType, settings.soundVolume);
      }
      if (settings.voiceEnabled) {
        soundService.speakVietnameseTrip(newTrip.pickup, newTrip.destination, newTrip.priceText, settings.voiceRate);
      }
      if (settings.browserNotificationEnabled) {
        soundService.sendDesktopNotification(
          `Khớp Kèo Mới: ${newTrip.pickup} -> ${newTrip.destination}`,
          `Giá: ${newTrip.priceText} · ${newTrip.vehicleTypeLabel} · ĐT: ${newTrip.phoneNumber || 'Inbox'}`
        );
      }
    }

    setTrips(prev => [newTrip, ...prev.slice(0, 149)]); // keep max 150 trips in memory
  };

  // Seed initial trips on first load
  useEffect(() => {
    const initialSeed: Trip[] = [];
    const activeGroupNames = groups.filter(g => g.isActive);

    for (let i = 0; i < 8; i++) {
      const mock = MOCK_RAW_ZALO_MESSAGES[i % MOCK_RAW_ZALO_MESSAGES.length];
      const parsed = TripParser.parseRawMessage(mock.text, mock.groupName, mock.groupId);
      // stagger timestamps slightly
      parsed.timestamp = Date.now() - (8 - i) * 15000;
      const matchResult = TripParser.matchTripWithRules(parsed, rules);
      parsed.isMatched = matchResult.isMatched;
      parsed.matchedRules = matchResult.matchedRuleNames;
      initialSeed.unshift(parsed);
    }
    setTrips(initialSeed);
  }, []);

  // Real-Time Ingestion Loop
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const activeGroups = groups.filter(g => g.isActive);
      if (activeGroups.length === 0) return;

      // Pick next mock message
      const mockItem = MOCK_RAW_ZALO_MESSAGES[mockIndexRef.current % MOCK_RAW_ZALO_MESSAGES.length];
      mockIndexRef.current += 1;

      // Pick a random active group
      const randomGroup = activeGroups[Math.floor(Math.random() * activeGroups.length)];

      const trip = TripParser.parseRawMessage(mockItem.text, randomGroup.name, randomGroup.id);
      ingestTrip(trip);
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed, groups, rules, settings]);

  // Fast Actions
  const handleClaimTrip = (trip: Trip) => {
    const updatedTrip: Trip = { ...trip, status: 'claimed', claimedAt: Date.now() };
    const updatedClaimed = [updatedTrip, ...claimedTrips.filter(t => t.id !== trip.id)];
    handleSaveClaimedTrips(updatedClaimed);

    // Update in live feed as well
    setTrips(prev => prev.map(t => t.id === trip.id ? updatedTrip : t));

    // Play subtle claim success ping
    soundService.playAlertSound('bell', 0.6);
    showToast(`Đã nhận cuốc: ${trip.pickup} -> ${trip.destination}!`);
  };

  const handleUpdateTripStatus = (tripId: string, newStatus: Trip['status']) => {
    const updatedClaimed = claimedTrips.map(t => t.id === tripId ? { ...t, status: newStatus } : t);
    handleSaveClaimedTrips(updatedClaimed);
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatus } : t));
    showToast('Đã cập nhật trạng thái cuốc xe');
  };

  const handleRemoveClaimedTrip = (tripId: string) => {
    const updatedClaimed = claimedTrips.filter(t => t.id !== tripId);
    handleSaveClaimedTrips(updatedClaimed);
    showToast('Đã xoá cuốc khỏi sổ');
  };

  const handleClearAllClaimed = () => {
    handleSaveClaimedTrips([]);
    showToast('Đã làm trống sổ cuốc');
  };

  const handleCopyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Đã sao chép tin nhắn chốt vào bộ nhớ tạm!');
  };

  // Filtered trips for the active view
  const displayTrips = useMemo(() => {
    return trips.filter(trip => {
      // 1. Phone number filter
      if (onlyWithPhone && !trip.phoneNumber) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullContent = `${trip.pickup} ${trip.destination} ${trip.priceText} ${trip.phoneNumber || ''} ${trip.rawText} ${trip.sourceGroup}`.toLowerCase();
        if (!fullContent.includes(q)) {
          return false;
        }
      }

      // 3. Segmented view filter
      if (activeView === 'matched_only') {
        return trip.isMatched;
      }
      if (activeView === 'airport') {
        const text = `${trip.pickup} ${trip.destination} ${trip.rawText}`.toLowerCase();
        return text.includes('nội bài') || text.includes('nb') || text.includes('tân sơn nhất') || text.includes('tsn');
      }
      if (activeView === '4cho') {
        return trip.vehicleType === '4_cho';
      }
      if (activeView === '7cho') {
        return trip.vehicleType === '7_cho';
      }
      if (activeView === 'long_trip') {
        return trip.vehicleType === 'bao_xe' || trip.vehicleType === 'xe_ghep';
      }

      return true;
    });
  }, [trips, activeView, searchQuery, onlyWithPhone]);

  // Statistics
  const matchedCount = useMemo(() => trips.filter(t => t.isMatched).length, [trips]);
  const activeRulesCount = useMemo(() => rules.filter(r => r.isActive).length, [rules]);
  const activeGroupsCount = useMemo(() => groups.filter(g => g.isActive).length, [groups]);
  const totalEarnings = useMemo(() => {
    return claimedTrips
      .filter(t => t.status === 'completed' || t.status === 'in_progress' || t.status === 'claimed')
      .reduce((sum, t) => sum + (t.price || 0), 0);
  }, [claimedTrips]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header (Compliant with Top Bar Contract: 3 zones separated by gap-8) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        activeRulesCount={activeRulesCount}
        claimedCount={claimedTrips.length}
        activeGroupsCount={activeGroupsCount}
      />

      {/* 2. Top Metric Bar with Tabular Figures */}
      <StatsBar
        totalTrips={trips.length}
        matchedTrips={matchedCount}
        claimedTrips={claimedTrips.length}
        totalEarnings={totalEarnings}
        currentRate={`${Math.round(60 / (streamSpeed / 1000))} tin/phút`}
      />

      {/* 3. Main Workspace Canvas */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'claimed' ? (
          <ClaimedTripsView
            claimedTrips={claimedTrips}
            onUpdateTripStatus={handleUpdateTripStatus}
            onRemoveClaimedTrip={handleRemoveClaimedTrip}
            onClearAllClaimed={handleClearAllClaimed}
          />
        ) : currentTab === 'filters' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Quản Lý Bộ Lọc Tuyến Đường & Bắn Kèo</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Định cấu hình các tuyến đường ruột, mức giá tối thiểu, loại xe và từ khoá ưu tiên/loại trừ để hệ thống tự động phát âm thanh cảnh báo.
                </p>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Mở Trình Sửa Bộ Lọc</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-5 rounded-xl border transition-all ${
                    rule.isActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-100">{rule.name}</span>
                    <button
                      onClick={() => {
                        const updated = rules.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r);
                        handleSaveRules(updated);
                      }}
                      className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                        rule.isActive
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rule.isActive ? 'Đang bật' : 'Đã tắt'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Tuyến quét:</span>
                      <span className="text-slate-200">
                        {rule.routes.map(r => `${r.pickupKeywords.join('/')} ⇄ ${r.destinationKeywords.join('/')}`).join(' | ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span>Giá tối thiểu:</span>
                      <span className="font-mono text-amber-400 font-bold tabular-nums">
                        {(rule.minPrice / 1000).toLocaleString('vi-VN')}k VNĐ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Loại xe:</span>
                      <span className="text-slate-200 font-medium">{rule.vehicleTypes.join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Bell className="w-3 h-3 text-emerald-400" /> Báo chuông
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Đọc giọng nói
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : currentTab === 'groups' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Nhóm Zalo Đang Giám Sát</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Chọn các hội nhóm Zalo tiện chuyến, xe ghép để ứng dụng quét và lắng nghe cuốc xe mới.
                </p>
              </div>
              <button
                onClick={() => setIsGroupsModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Quản Lý Nhóm & Thêm Nhóm</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`p-5 rounded-xl border transition-all ${
                    group.isActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-100">{group.name}</span>
                    <button
                      onClick={() => {
                        const updated = groups.map(g => g.id === group.id ? { ...g, isActive: !g.isActive } : g);
                        handleSaveGroups(updated);
                      }}
                      className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                        group.isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {group.isActive ? 'Đang quét' : 'Tạm dừng'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Số lượng thành viên:</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {group.memberCount.toLocaleString('vi-VN')} tài xế
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Tần suất tin nhắn:</span>
                      <span className="text-emerald-400 font-semibold">{group.messageRate}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span>Phân loại:</span>
                      <span className="text-slate-300">
                        {group.category === 'san_bay' ? 'Sân Bay' : group.category === 'mien_bac' ? 'Miền Bắc' : group.category === 'mien_nam' ? 'Miền Nam' : 'Liên Tỉnh'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : currentTab === 'settings' ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Cài Đặt Âm Báo & Giọng Đọc</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Tuỳ chỉnh kiểu chuông, âm lượng và giọng đọc tiếng Việt khi phát hiện cuốc xe mới.
                </p>
              </div>
              <button
                onClick={() => setIsAudioModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <Bell className="w-4 h-4" />
                <span>Mở Trình Chỉnh Âm</span>
              </button>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Chuông Cảnh Báo (Web Audio)</div>
                  <div className="text-xs text-slate-400">Kiểu chuông: {settings.soundType} · Âm lượng: {Math.round(settings.soundVolume * 100)}%</div>
                </div>
                <button
                  onClick={() => soundService.playAlertSound(settings.soundType, settings.soundVolume)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Nghe Thử
                </button>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white">Giọng Đọc Tiếng Việt (TTS)</div>
                  <div className="text-xs text-slate-400">
                    Trạng thái: {settings.voiceEnabled ? 'Bật' : 'Tắt'} · Tốc độ: {settings.voiceRate.toFixed(2)}x
                  </div>
                </div>
                <button
                  onClick={() => soundService.speakVietnameseTrip('Nội Bài', 'Cầu Giấy', 'ba trăm nghìn đồng', settings.voiceRate)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold"
                >
                  Đọc Thử Câu Mẫu
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Thông Báo Đẩy Desktop</div>
                  <div className="text-xs text-slate-400">
                    Trạng thái quyền trình duyệt: {typeof Notification !== 'undefined' ? Notification.permission : 'Không hỗ trợ'}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const granted = await soundService.requestNotificationPermission();
                    if (granted) {
                      soundService.sendDesktopNotification('ZaloRide Radar', 'Thông báo desktop hoạt động bình thường!');
                      showToast('Đã kích hoạt thông báo desktop');
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  Cấp Quyền & Thử
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* RADAR VIEW (Default) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Real-Time Stream & Filters */}
            <div className="lg:col-span-8 space-y-4">
              {/* Radar stream controls */}
              <RadarControls
                speed={streamSpeed}
                onSpeedChange={(s) => setStreamSpeed(s)}
                settings={settings}
                onUpdateSettings={(newPartial) => handleSaveSettings({ ...settings, ...newPartial })}
                onSimulateSingle={() => {
                  const mock = MOCK_RAW_ZALO_MESSAGES[Math.floor(Math.random() * MOCK_RAW_ZALO_MESSAGES.length)];
                  const trip = TripParser.parseRawMessage(mock.text, mock.groupName, mock.groupId);
                  ingestTrip(trip);
                }}
                onOpenPasteModal={() => setIsPasteModalOpen(true)}
                onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
                onClearTrips={() => setTrips([])}
              />

              {/* Filter bar */}
              <FilterBar
                activeView={activeView}
                setActiveView={setActiveView}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onlyWithPhone={onlyWithPhone}
                setOnlyWithPhone={setOnlyWithPhone}
                matchedCount={matchedCount}
                totalCount={trips.length}
                onOpenFilterManager={() => setIsFilterModalOpen(true)}
              />

              {/* Feed Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Luồng Tin Nhắn Thời Gian Thực</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{displayTrips.length} cuốc hiển thị</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-medium">Lắng nghe Zalo</span>
                </div>
              </div>

              {/* Feed List */}
              {displayTrips.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                  <Radio className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                  <h3 className="text-base font-semibold text-slate-300">Đang quét tìm cuốc mới theo bộ lọc...</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hiện chưa có cuốc nào khớp điều kiện lọc hiện tại. Hãy chuyển sang tab "Tất Cả" hoặc bấm "Bắn Đơn Thử" để kiểm tra.
                  </p>
                  <button
                    onClick={() => setActiveView('all')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Xem Tất Cả Cuốc ({trips.length})
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onClaimTrip={handleClaimTrip}
                      quickTemplates={templates}
                      onCopyTemplate={handleCopyTemplate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 Cols: Live Dispatch Radar & Active Rules Quick-Toggles */}
            <div className="lg:col-span-4 space-y-5">
              {/* Active Rules Radar Card */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Bộ Lọc Tuyến Đang Bật</h3>
                  </div>
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Sửa
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      onClick={() => {
                        const updated = rules.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r);
                        handleSaveRules(updated);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        rule.isActive
                          ? 'bg-slate-950 border-amber-500/30 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold text-slate-100 truncate">{rule.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Tối thiểu: {(rule.minPrice / 1000).toLocaleString('vi-VN')}k · {rule.vehicleTypes.join(', ')}
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          rule.isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800'
                        }`}
                      >
                        {rule.isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
                >
                  + Thêm Tuyến Đường Mới
                </button>
              </div>

              {/* Radar Tactical Guide */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Kinh Nghiệm Săn Kèo Zalo</span>
                </div>

                <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">1.</span>
                    <span>Bật sẵn <strong>Giọng Đọc VN</strong> để khi lái xe không cần nhìn màn hình vẫn nghe được điểm đón và giá tiền.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">2.</span>
                    <span>Bấm nút <strong>Gọi Ngay</strong> hoặc <strong>Chép Mẫu</strong> để chốt với nhà xe trong vòng 5 giây đầu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">3.</span>
                    <span>Đơn sau khi chốt hãy bấm <strong>Nhận Cuốc</strong> để lưu vào sổ chuyến đi và theo dõi doanh thu hàng ngày.</span>
                  </li>
                </ul>
              </div>

              {/* Connected Groups Quick View */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Hội Nhóm Đang Quét ({activeGroupsCount})</h3>
                  </div>
                  <button
                    onClick={() => setIsGroupsModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {groups.slice(0, 4).map(g => (
                    <div key={g.id} className="flex items-center justify-between text-slate-300">
                      <span className="truncate max-w-[200px]">{g.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums">{g.messageRate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 border border-amber-500/50 text-slate-100 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <FilterManagerModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        rules={rules}
        onSaveRules={handleSaveRules}
      />

      <ZaloGroupsModal
        isOpen={isGroupsModalOpen}
        onClose={() => setIsGroupsModalOpen(false)}
        groups={groups}
        onSaveGroups={handleSaveGroups}
      />

      <ManualPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        rules={rules}
        onInjectTrip={ingestTrip}
      />

      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <WebhookInfoModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        rules={rules}
        onInjectTrip={ingestTrip}
      />
    </div>
  );
}
