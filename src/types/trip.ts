export type VehicleType = '4_cho' | '7_cho' | 'xe_ghep' | 'bao_xe' | 'xe_may' | 'bat_ky';

export interface Trip {
  id: string;
  rawText: string;
  sourceGroup: string;
  groupId: string;
  timestamp: number;
  pickup: string;
  destination: string;
  vehicleType: VehicleType;
  vehicleTypeLabel: string;
  price: number | null; // in VND, null if thỏa thuận
  priceText: string;
  pickupTime: string;
  phoneNumber?: string;
  contactName?: string;
  seats?: number;
  notes?: string;
  matchedRules: string[];
  isMatched: boolean;
  isUrgent?: boolean;
  status: 'new' | 'claimed' | 'in_progress' | 'completed' | 'cancelled';
  claimedAt?: number;
}

export interface ZaloGroup {
  id: string;
  name: string;
  category: 'mien_bac' | 'mien_nam' | 'san_bay' | 'lien_tinh';
  memberCount: number;
  isActive: boolean;
  avatarColor: string;
  messageRate: string; // e.g., "12 tin/phút"
}

export interface FilterRule {
  id: string;
  name: string;
  isActive: boolean;
  routes: Array<{
    pickupKeywords: string[];
    destinationKeywords: string[];
  }>;
  minPrice: number;
  vehicleTypes: VehicleType[];
  keywordsWhitelist: string[];
  keywordsBlacklist: string[];
  notifySound: boolean;
  notifyVoice: boolean;
  notifyBrowser: boolean;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  browserNotificationEnabled: boolean;
  soundType: 'chime' | 'radar' | 'double_beep' | 'bell';
  soundVolume: number; // 0.0 to 1.0
  voiceRate: number; // 0.8 to 1.5
}

export interface QuickTemplate {
  id: string;
  name: string;
  content: string; // e.g. "Chào anh/chị, em nhận xe {vehicle} đón {pickup} về {destination} nhé ạ!"
}
