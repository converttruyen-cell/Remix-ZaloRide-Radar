import { FilterRule, ZaloGroup, NotificationSettings, QuickTemplate, Trip } from '../types/trip';
import { INITIAL_FILTER_RULES, INITIAL_ZALO_GROUPS, INITIAL_QUICK_TEMPLATES } from './mockZaloData';

const STORAGE_KEYS = {
  RULES: 'zaloride_rules_v1',
  GROUPS: 'zaloride_groups_v1',
  SETTINGS: 'zaloride_settings_v1',
  TEMPLATES: 'zaloride_templates_v1',
  CLAIMED: 'zaloride_claimed_trips_v1',
};

export const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  voiceEnabled: true,
  browserNotificationEnabled: false,
  soundType: 'chime',
  soundVolume: 0.8,
  voiceRate: 1.05,
};

export class StorageService {
  public static getRules(): FilterRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_FILTER_RULES;
  }

  public static saveRules(rules: FilterRule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    } catch {}
  }

  public static getGroups(): ZaloGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_ZALO_GROUPS;
  }

  public static saveGroups(groups: ZaloGroup[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch {}
  }

  public static getSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {}
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }

  public static getTemplates(): QuickTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_QUICK_TEMPLATES;
  }

  public static saveTemplates(templates: QuickTemplate[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch {}
  }

  public static getClaimedTrips(): Trip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLAIMED);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }

  public static saveClaimedTrips(trips: Trip[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLAIMED, JSON.stringify(trips));
    } catch {}
  }
}
