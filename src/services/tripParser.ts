import { Trip, VehicleType, FilterRule } from '../types/trip';

// Common Vietnamese ride slang and abbreviation dictionary
const LOCATION_ABBREVIATIONS: Record<string, string> = {
  'nb': 'Sân bay Nội Bài',
  'nội bài': 'Sân bay Nội Bài',
  'tsn': 'Sân bay Tân Sơn Nhất',
  'tân sơn nhất': 'Sân bay Tân Sơn Nhất',
  'cg': 'Cầu Giấy, Hà Nội',
  'cầu giấy': 'Cầu Giấy, Hà Nội',
  'hđ': 'Hà Đông, Hà Nội',
  'hà đông': 'Hà Đông, Hà Nội',
  'tx': 'Thanh Xuân, Hà Nội',
  'thanh xuân': 'Thanh Xuân, Hà Nội',
  'hbt': 'Hai Bà Trưng, Hà Nội',
  'bđ': 'Ba Đình, Hà Nội',
  'hk': 'Hoàn Kiếm, Hà Nội',
  'hp': 'Hải Phòng',
  'qn': 'Quảng Ninh',
  'bn': 'Bắc Ninh',
  'bg': 'Bắc Giang',
  'tn': 'Thái Nguyên',
  'hd': 'Hải Dương',
  'nd': 'Nam Định',
  'tb': 'Thái Bình',
  'vt': 'Vũng Tàu',
  'bd': 'Bình Dương',
  'đn': 'Đồng Nai',
  'q1': 'Quận 1, TP.HCM',
  'q7': 'Quận 7, TP.HCM',
  'bt': 'Bình Thạnh, TP.HCM',
  'td': 'Thủ Đức, TP.HCM',
};

export class TripParser {
  /**
   * Parse a raw Zalo message into a structured Trip object
   */
  public static parseRawMessage(rawText: string, sourceGroup: string, groupId: string = 'grp_1'): Trip {
    const id = 'trip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const clean = rawText.trim();

    // 1. Extract Phone Number
    const phoneRegex = /(?:0|\+84)(?:[1-9][0-9]{8}|[3|5|7|8|9][0-9]{8})\b|0\d{2,3}[.\s]\d{3}[.\s]\d{3,4}/g;
    const phoneMatches = clean.match(phoneRegex);
    let phoneNumber: string | undefined = undefined;
    if (phoneMatches && phoneMatches.length > 0) {
      phoneNumber = phoneMatches[0].replace(/[\s.-]/g, '');
      if (phoneNumber.startsWith('+84')) {
        phoneNumber = '0' + phoneNumber.slice(3);
      }
    }

    // 2. Extract Vehicle Type
    let vehicleType: VehicleType = '4_cho';
    let vehicleTypeLabel = 'Xe 4 chỗ';

    const lower = clean.toLowerCase();
    if (/7\s*c|7\s*chỗ|bảy chỗ|fortuner|innova|xpander|carnival/i.test(lower)) {
      vehicleType = '7_cho';
      vehicleTypeLabel = 'Xe 7 chỗ';
    } else if (/xe\s*ghép|khách\s*ghép|ghép\s*\d|1\s*ghế|2\s*ghế|ghép\s*người/i.test(lower)) {
      vehicleType = 'xe_ghep';
      vehicleTypeLabel = 'Xe ghép';
    } else if (/bao\s*xe|nguyên\s*xe|trọn\s*gói|hợp\s*đồng/i.test(lower)) {
      vehicleType = 'bao_xe';
      vehicleTypeLabel = 'Bao trọn xe';
    } else if (/xe\s*máy|ship|giao\s*hàng|chở\s*đồ/i.test(lower)) {
      vehicleType = 'xe_may';
      vehicleTypeLabel = 'Xe máy / Giao hàng';
    } else if (/4\s*c|4\s*chỗ|bốn chỗ|sedan|vios|accent|i10|morning/i.test(lower)) {
      vehicleType = '4_cho';
      vehicleTypeLabel = 'Xe 4 chỗ';
    }

    // 3. Extract Price
    let price: number | null = null;
    let priceText = 'Thoả thuận';

    // Check millions (e.g., 1.2tr, 1tr5, 2 triệu, 1 củ)
    const millionMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:tr|triệu|củ|m\b)/);
    const complexMillionMatch = lower.match(/(\d+)\s*tr\s*(\d+)/); // e.g. 1tr2 = 1.2m
    const lốpMatch = lower.match(/(\d+)\s*(?:lốp|xị)/); // 3 lốp = 300k
    const kMatch = lower.match(/(\d{1,4})\s*k\b/); // 350k
    const thousandFullMatch = lower.match(/(\d{2,4})\s*(?:nghìn|ngàn)/);
    const standardVndMatch = lower.match(/(\d{1,3}(?:\.\d{3})+)\s*(?:đ|vnd|vnđ)?/);

    if (complexMillionMatch) {
      const whole = parseInt(complexMillionMatch[1], 10);
      const frac = parseInt(complexMillionMatch[2], 10);
      price = whole * 1000000 + frac * 100000;
      priceText = (price / 1000).toLocaleString('vi-VN') + 'k';
    } else if (millionMatch) {
      const val = parseFloat(millionMatch[1].replace(',', '.'));
      price = Math.round(val * 1000000);
      priceText = val >= 1 ? `${val} triệu` : `${price / 1000}k`;
    } else if (lốpMatch) {
      const val = parseInt(lốpMatch[1], 10);
      price = val * 100000;
      priceText = `${val * 100}k`;
    } else if (kMatch) {
      const val = parseInt(kMatch[1], 10);
      price = val * 1000;
      priceText = `${val}k`;
    } else if (thousandFullMatch) {
      const val = parseInt(thousandFullMatch[1], 10);
      price = val * 1000;
      priceText = `${val}k`;
    } else if (standardVndMatch) {
      const rawNum = standardVndMatch[1].replace(/\./g, '');
      price = parseInt(rawNum, 10);
      priceText = (price / 1000).toLocaleString('vi-VN') + 'k';
    }

    // 4. Extract Pickup Time
    let pickupTime = 'Càng sớm càng tốt';
    const timeMatch = lower.match(/(?:đón\s*)?(?:lúc\s*)?(\d{1,2}(?:h|g|:)\d{0,2})\s*(?:sáng|trưa|chiều|tối)?\s*(?:hôm\s*nay|chiều\s*nay|tối\s*nay|sáng\s*mai|ngày\s*mai)?/);
    if (/gấp|luôn|ngay\s*bây\s*giờ|đón\s*ngay/i.test(lower)) {
      pickupTime = 'Đón gấp ngay bây giờ';
    } else if (timeMatch) {
      pickupTime = timeMatch[0].trim();
      // Capitalize first letter
      pickupTime = pickupTime.charAt(0).toUpperCase() + pickupTime.slice(1);
    }

    // 5. Extract Route (Pickup and Destination)
    let pickup = 'Chưa xác định';
    let destination = 'Chưa xác định';

    // Check arrows e.g., "A -> B", "A => B", "A đến B", "A về B", "từ A đi B"
    const arrowRegex = /^(?:cần\s*xe|tiện\s*chuyến|khách\s*ghép|tìm\s*xe|có\s*khách)?\s*(.+?)\s*(?:->|-->|=>|về|đi|sang|tới|đến)\s*(.+?)(?:(?:đón|lúc|lúc\s*\d|giá|\d+k|\d+tr|\d+c|sđt|lh|zalo|\d{9,11}|$))/i;
    const arrowMatch = clean.match(arrowRegex);

    if (arrowMatch && arrowMatch[1] && arrowMatch[2]) {
      let p = arrowMatch[1].trim();
      let d = arrowMatch[2].trim();

      // Remove leading words like "từ", "cần xe", "xe tiện chuyến"
      p = p.replace(/^(cần xe|tiện chuyến|khách ghép|tìm xe|từ|có khách|bắn kèo|xe\s*\d+c)\s+/i, '').trim();
      // Clean trailing garbage from destination
      d = d.replace(/(sđt|lh|zalo|dt|đt|giá|lúc|đón|ngày|hôm nay|mai|\d+k).*$/i, '').trim();

      if (p.length > 1) pickup = normalizeLocation(p);
      if (d.length > 1) destination = normalizeLocation(d);
    } else {
      // Fallback heuristics: look for "từ X" and "về Y"
      const fromMatch = clean.match(/(?:từ|đón\s*tại|đón\s*ở)\s+([^,.;\n]+?)(?=\s+(?:về|đi|sang|tới|đến|lúc|giá|sđt|0\d))/i);
      const toMatch = clean.match(/(?:về|đi|sang|tới|đến)\s+([^,.;\n]+?)(?=\s+(?:lúc|đón|giá|\d+k|\d+tr|sđt|lh|zalo|0\d|$))/i);

      if (fromMatch && fromMatch[1]) {
        pickup = normalizeLocation(fromMatch[1].trim());
      }
      if (toMatch && toMatch[1]) {
        destination = normalizeLocation(toMatch[1].trim());
      }
    }

    // Notes
    let notes = '';
    if (/vali|hành\s*lý/i.test(lower)) notes += 'Có hành lý. ';
    if (/gấp|vội|khách\s*cần\s*ngay/i.test(lower)) notes += 'Khách cần xe gấp! ';
    if (/bao\s*vé\s*cầu\s*đường|đã\s*bao\s*phí/i.test(lower)) notes += 'Bao phí cầu đường. ';
    if (/không\s*mào/i.test(lower)) notes += 'Yêu cầu xe không biển vàng/không mào. ';

    const isUrgent = /gấp|luôn|ngay\s*bây\s*giờ|đón\s*ngay/i.test(lower);

    return {
      id,
      rawText: clean,
      sourceGroup,
      groupId,
      timestamp: Date.now(),
      pickup,
      destination,
      vehicleType,
      vehicleTypeLabel,
      price,
      priceText,
      pickupTime,
      phoneNumber,
      notes: notes.trim() || undefined,
      matchedRules: [],
      isMatched: false,
      isUrgent,
      status: 'new'
    };
  }

  /**
   * Evaluate a Trip against a list of active FilterRules
   */
  public static matchTripWithRules(trip: Trip, rules: FilterRule[]): { isMatched: boolean; matchedRuleNames: string[] } {
    const matchedRuleNames: string[] = [];
    const textToSearch = `${trip.rawText} ${trip.pickup} ${trip.destination}`.toLowerCase();

    for (const rule of rules) {
      if (!rule.isActive) continue;

      // 1. Blacklist check - if ANY blacklist keyword is present, rule does not match
      if (rule.keywordsBlacklist && rule.keywordsBlacklist.length > 0) {
        const hasBlacklist = rule.keywordsBlacklist.some(kw => {
          const k = kw.trim().toLowerCase();
          return k.length > 0 && textToSearch.includes(k);
        });
        if (hasBlacklist) continue;
      }

      // 2. Vehicle type check
      if (rule.vehicleTypes && rule.vehicleTypes.length > 0 && !rule.vehicleTypes.includes('bat_ky')) {
        if (!rule.vehicleTypes.includes(trip.vehicleType)) {
          continue;
        }
      }

      // 3. Min price check (if trip has defined price)
      if (rule.minPrice > 0 && trip.price !== null) {
        if (trip.price < rule.minPrice) {
          continue;
        }
      }

      // 4. Route matching (Pickups and Destinations)
      let routeMatched = true;
      if (rule.routes && rule.routes.length > 0) {
        routeMatched = rule.routes.some(r => {
          const pickupMatch = r.pickupKeywords.length === 0 || r.pickupKeywords.some(kw => {
            const k = kw.trim().toLowerCase();
            return k.length > 0 && (trip.pickup.toLowerCase().includes(k) || textToSearch.includes(k));
          });
          const destMatch = r.destinationKeywords.length === 0 || r.destinationKeywords.some(kw => {
            const k = kw.trim().toLowerCase();
            return k.length > 0 && (trip.destination.toLowerCase().includes(k) || textToSearch.includes(k));
          });
          return pickupMatch && destMatch;
        });
      }

      // 5. Whitelist keywords check (if defined, must contain at least one)
      let whitelistMatched = true;
      if (rule.keywordsWhitelist && rule.keywordsWhitelist.length > 0) {
        whitelistMatched = rule.keywordsWhitelist.some(kw => {
          const k = kw.trim().toLowerCase();
          return k.length > 0 && textToSearch.includes(k);
        });
      }

      if (routeMatched && whitelistMatched) {
        matchedRuleNames.push(rule.name);
      }
    }

    return {
      isMatched: matchedRuleNames.length > 0,
      matchedRuleNames,
    };
  }
}

function normalizeLocation(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (LOCATION_ABBREVIATIONS[lower]) {
    return LOCATION_ABBREVIATIONS[lower];
  }

  // Check prefix match
  for (const [abbr, full] of Object.entries(LOCATION_ABBREVIATIONS)) {
    if (lower === abbr) return full;
  }

  // Capitalize neatly
  return trimmed
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
