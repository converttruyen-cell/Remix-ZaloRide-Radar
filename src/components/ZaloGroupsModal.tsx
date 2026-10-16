import React, { useState } from 'react';
import { ZaloGroup } from '../types/trip';
import { MessageSquare, Plus, Check, Trash2, X, Users, Radio } from 'lucide-react';

interface ZaloGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: ZaloGroup[];
  onSaveGroups: (groups: ZaloGroup[]) => void;
}

export const ZaloGroupsModal: React.FC<ZaloGroupsModalProps> = ({
  isOpen,
  onClose,
  groups,
  onSaveGroups,
}) => {
  const [editingGroups, setEditingGroups] = useState<ZaloGroup[]>(groups);
  const [newGroupName, setNewGroupName] = useState('');
  const [newCategory, setNewCategory] = useState<ZaloGroup['category']>('lien_tinh');
  const [newMemberCount, setNewMemberCount] = useState('2500');

  if (!isOpen) return null;

  const handleToggleGroup = (id: string) => {
    const updated = editingGroups.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g);
    setEditingGroups(updated);
    onSaveGroups(updated);
  };

  const handleDeleteGroup = (id: string) => {
    const updated = editingGroups.filter(g => g.id !== id);
    setEditingGroups(updated);
    onSaveGroups(updated);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: ZaloGroup = {
      id: 'grp_' + Date.now(),
      name: newGroupName.trim(),
      category: newCategory,
      memberCount: parseInt(newMemberCount, 10) || 1000,
      isActive: true,
      avatarColor: 'bg-emerald-600',
      messageRate: '15-30 tin/phút',
    };

    const updated = [...editingGroups, newGroup];
    setEditingGroups(updated);
    onSaveGroups(updated);

    setNewGroupName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Quản Lý Nhóm Zalo Đang Quét</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Add group form */}
          <form onSubmit={handleAddGroup} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-bold text-blue-400">Thêm Nhóm Zalo Mới Cần Quét Đơn</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tên nhóm Zalo</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ví dụ: Kèo Xe Ghép Hà Nội - Thái Nguyên"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Khu vực / Loại nhóm</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ZaloGroup['category'])}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="san_bay">Sân Bay (Nội Bài / TSN)</option>
                  <option value="mien_bac">Miền Bắc</option>
                  <option value="mien_nam">Miền Nam</option>
                  <option value="lien_tinh">Liên Tỉnh Đường Dài</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Nhóm</span>
              </button>
            </div>
          </form>

          {/* Groups list */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400">
              Danh sách nhóm đang giám sát ({editingGroups.filter(g => g.isActive).length}/{editingGroups.length} đang bật):
            </div>

            {editingGroups.map((group) => (
              <div
                key={group.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  group.isActive
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-slate-950/50 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleGroup(group.id)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                      group.isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {group.isActive ? <Check className="w-4 h-4 font-bold" /> : null}
                  </button>

                  <div>
                    <div className="text-sm font-bold text-slate-100">{group.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="font-mono tabular-nums">{group.memberCount.toLocaleString('vi-VN')}</span> thành viên
                      </span>
                      <span>·</span>
                      <span className="text-emerald-400">{group.messageRate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                  title="Xoá nhóm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
