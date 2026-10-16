import React, { useState } from 'react';
import { FilterRule, VehicleType } from '../types/trip';
import { Plus, Trash2, Check, SlidersHorizontal, Bell, Volume2, Mic, X } from 'lucide-react';

interface FilterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: FilterRule[];
  onSaveRules: (rules: FilterRule[]) => void;
}

export const FilterManagerModal: React.FC<FilterManagerModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSaveRules,
}) => {
  const [editingRules, setEditingRules] = useState<FilterRule[]>(rules);
  const [newRuleName, setNewRuleName] = useState('');
  const [newPickup, setNewPickup] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newMinPrice, setNewMinPrice] = useState('300000');
  const [newVehicles, setNewVehicles] = useState<VehicleType[]>(['4_cho', '7_cho']);
  const [newBlacklist, setNewBlacklist] = useState('bảo hiểm, bán xe, quảng cáo, cho vay');

  if (!isOpen) return null;

  const handleToggleRule = (id: string) => {
    const updated = editingRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    setEditingRules(updated);
    onSaveRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = editingRules.filter(r => r.id !== id);
    setEditingRules(updated);
    onSaveRules(updated);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const pickupKeywords = newPickup.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const destKeywords = newDest.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const blacklist = newBlacklist.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    const newRule: FilterRule = {
      id: 'rule_' + Date.now(),
      name: newRuleName.trim(),
      isActive: true,
      routes: [
        {
          pickupKeywords,
          destinationKeywords: destKeywords,
        },
      ],
      minPrice: parseInt(newMinPrice, 10) || 0,
      vehicleTypes: newVehicles.length > 0 ? newVehicles : ['4_cho', '7_cho'],
      keywordsWhitelist: [],
      keywordsBlacklist: blacklist,
      notifySound: true,
      notifyVoice: true,
      notifyBrowser: true,
    };

    const updated = [newRule, ...editingRules];
    setEditingRules(updated);
    onSaveRules(updated);

    // Reset form
    setNewRuleName('');
    setNewPickup('');
    setNewDest('');
  };

  const handleAddPreset = (presetName: string, pickups: string[], dests: string[], minP: number) => {
    const preset: FilterRule = {
      id: 'rule_' + Date.now(),
      name: presetName,
      isActive: true,
      routes: [
        {
          pickupKeywords: pickups,
          destinationKeywords: dests,
        },
        {
          pickupKeywords: dests,
          destinationKeywords: pickups,
        },
      ],
      minPrice: minP,
      vehicleTypes: ['4_cho', '7_cho', 'bao_xe'],
      keywordsWhitelist: [],
      keywordsBlacklist: ['bảo hiểm', 'bán xe', 'vay vốn'],
      notifySound: true,
      notifyVoice: true,
      notifyBrowser: true,
    };

    const updated = [preset, ...editingRules];
    setEditingRules(updated);
    onSaveRules(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Quản Lý Bộ Lọc Tuyến Đường & Kèo Xe</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick presets */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Thêm nhanh tuyến mẫu thông dụng:</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAddPreset('Tuyến Nội Bài ⇄ Cầu Giấy / Mỹ Đình', ['nội bài', 'nb'], ['cầu giấy', 'mỹ đình', 'cg'], 250000)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                + Tuyến Nội Bài ⇄ Cầu Giấy
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Tuyến Hà Nội ⇄ Hải Phòng', ['hà nội', 'giáp bát'], ['hải phòng', 'hp'], 500000)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                + Tuyến Hà Nội ⇄ Hải Phòng
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Tuyến Sài Gòn ⇄ Vũng Tàu', ['sài gòn', 'tsn', 'tân sơn nhất'], ['vũng tàu', 'vt'], 400000)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                + Tuyến Sài Gòn ⇄ Vũng Tàu
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Tuyến Bắc Ninh ⇄ Nội Bài', ['bắc ninh', 'bn'], ['nội bài', 'nb'], 300000)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                + Tuyến Bắc Ninh ⇄ Nội Bài
              </button>
            </div>
          </div>

          {/* Form to add custom rule */}
          <form onSubmit={handleAddRule} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-bold text-amber-400">Tạo Bộ Lọc Mới</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tên bộ lọc</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="Ví dụ: Kèo Nội Bài giá tốt"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Từ khoá điểm đón (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={newPickup}
                  onChange={(e) => setNewPickup(e.target.value)}
                  placeholder="nội bài, nb, soc son"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Từ khoá điểm đến</label>
                <input
                  type="text"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  placeholder="cầu giấy, hà đông, hoàn kiếm"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Giá tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  step="50000"
                  value={newMinPrice}
                  onChange={(e) => setNewMinPrice(e.target.value)}
                  placeholder="300000"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Từ khoá cấm / Spam (loại bỏ tin)</label>
                <input
                  type="text"
                  value={newBlacklist}
                  onChange={(e) => setNewBlacklist(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Lưu Bộ Lọc Mới</span>
              </button>
            </div>
          </form>

          {/* List of active rules */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400">Các bộ lọc hiện tại ({editingRules.length}):</div>
            {editingRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  rule.isActive
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-950/50 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        rule.isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rule.isActive ? <Check className="w-4 h-4 font-bold" /> : null}
                    </button>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{rule.name}</div>
                      <div className="text-xs text-slate-400 flex flex-wrap gap-2 mt-0.5">
                        <span>Giá tối thiểu: {(rule.minPrice / 1000).toLocaleString('vi-VN')}k</span>
                        <span>·</span>
                        <span>Loại xe: {rule.vehicleTypes.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Xoá bộ lọc này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
