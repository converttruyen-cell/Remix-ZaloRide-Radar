import { ZaloGroup, FilterRule, QuickTemplate } from '../types/trip';

export const INITIAL_ZALO_GROUPS: ZaloGroup[] = [
  {
    id: 'grp_noibai_247',
    name: 'Bắn Kèo Xe Sân Bay Nội Bài 24/7',
    category: 'san_bay',
    memberCount: 5240,
    isActive: true,
    avatarColor: 'bg-emerald-600',
    messageRate: '28 tin/phút',
  },
  {
    id: 'grp_hn_mienbac',
    name: 'Hội Xe Ghép & Tiện Chuyến Hà Nội - Miền Bắc',
    category: 'mien_bac',
    memberCount: 8910,
    isActive: true,
    avatarColor: 'bg-blue-600',
    messageRate: '45 tin/phút',
  },
  {
    id: 'grp_hn_hp_qn',
    name: 'Lái Xe Tiện Chuyến HN - Hải Phòng - Quảng Ninh',
    category: 'lien_tinh',
    memberCount: 4120,
    isActive: true,
    avatarColor: 'bg-indigo-600',
    messageRate: '19 tin/phút',
  },
  {
    id: 'grp_sg_vungtau',
    name: 'Kèo Xe Ghép Sài Gòn - Vũng Tàu - Biên Hoà',
    category: 'mien_nam',
    memberCount: 6830,
    isActive: true,
    avatarColor: 'bg-amber-600',
    messageRate: '32 tin/phút',
  },
  {
    id: 'grp_tsn_mientay',
    name: 'Xe Sân Bay Tân Sơn Nhất - Miền Tây',
    category: 'san_bay',
    memberCount: 3740,
    isActive: true,
    avatarColor: 'bg-teal-600',
    messageRate: '21 tin/phút',
  },
  {
    id: 'grp_bn_bg_nb',
    name: 'Hội Xe Ghép Bắc Ninh - Bắc Giang - Nội Bài',
    category: 'mien_bac',
    memberCount: 3450,
    isActive: true,
    avatarColor: 'bg-violet-600',
    messageRate: '15 tin/phút',
  },
];

export const INITIAL_FILTER_RULES: FilterRule[] = [
  {
    id: 'rule_noibai_caugiay',
    name: 'Tuyến Nội Bài ⇄ Cầu Giấy / Hà Nội',
    isActive: true,
    routes: [
      {
        pickupKeywords: ['nội bài', 'nb', 'sân bay nội bài'],
        destinationKeywords: ['cầu giấy', 'cg', 'hà nội', 'hà đông', 'thanh xuân', 'hoàn kiếm', 'mỹ đình'],
      },
      {
        pickupKeywords: ['cầu giấy', 'cg', 'hà nội', 'mỹ đình', 'thanh xuân', 'hà đông'],
        destinationKeywords: ['nội bài', 'nb', 'sân bay nội bài'],
      },
    ],
    minPrice: 200000,
    vehicleTypes: ['4_cho', '7_cho', 'bao_xe'],
    keywordsWhitelist: [],
    keywordsBlacklist: ['bảo hiểm', 'bán xe', 'tuyển lái xe', 'cho thuê'],
    notifySound: true,
    notifyVoice: true,
    notifyBrowser: true,
  },
  {
    id: 'rule_hn_haiphong',
    name: 'Tuyến Hà Nội ⇄ Hải Phòng / Quảng Ninh',
    isActive: true,
    routes: [
      {
        pickupKeywords: ['hà nội', 'giáp bát', 'nước ngầm', 'mỹ đình', 'gia lâm'],
        destinationKeywords: ['hải phòng', 'hp', 'quảng ninh', 'qn', 'hạ long'],
      },
      {
        pickupKeywords: ['hải phòng', 'hp', 'quảng ninh', 'qn', 'hạ long'],
        destinationKeywords: ['hà nội', 'giáp bát', 'nước ngầm', 'mỹ đình', 'gia lâm'],
      },
    ],
    minPrice: 500000,
    vehicleTypes: ['4_cho', '7_cho', 'xe_ghep', 'bao_xe'],
    keywordsWhitelist: [],
    keywordsBlacklist: ['tuyển dụng', 'bán xe'],
    notifySound: true,
    notifyVoice: false,
    notifyBrowser: true,
  },
  {
    id: 'rule_sg_vungtau',
    name: 'Tuyến Sài Gòn ⇄ Vũng Tàu / Tân Sơn Nhất',
    isActive: true,
    routes: [
      {
        pickupKeywords: ['tân sơn nhất', 'tsn', 'sài gòn', 'q1', 'quận 1', 'hồ chí minh'],
        destinationKeywords: ['vũng tàu', 'vt', 'bà rịa', 'đồng nai', 'biên hoà'],
      },
      {
        pickupKeywords: ['vũng tàu', 'vt', 'bà rịa'],
        destinationKeywords: ['tân sơn nhất', 'tsn', 'sài gòn', 'hồ chí minh'],
      },
    ],
    minPrice: 300000,
    vehicleTypes: ['4_cho', '7_cho', 'xe_ghep', 'bao_xe'],
    keywordsWhitelist: [],
    keywordsBlacklist: ['spam', 'quảng cáo'],
    notifySound: true,
    notifyVoice: true,
    notifyBrowser: false,
  },
];

export const INITIAL_QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'tpl_1',
    name: 'Chốt nhanh đón ngay',
    content: 'Chào anh/chị, em chạy xe {vehicle} đời mới, sẵn sàng đón {pickup} về {destination} nhé ạ. Em đón ngay được luôn ạ!',
  },
  {
    id: 'tpl_2',
    name: 'Báo giá chuẩn trọn gói',
    content: 'Bác ơi em nhận cuốc {pickup} đi {destination} giá {price} bao trọn gói cầu đường nhé. Bác cho em xin sđt khách em gọi đón luôn ạ!',
  },
  {
    id: 'tpl_3',
    name: 'Xe ghép lịch sự',
    content: 'Em có xe ghép tuyến {pickup} - {destination}, xe sạch sẽ không mùi, còn ghế trống. Em chốt cuốc này nhé sếp ơi!',
  },
];

export const MOCK_RAW_ZALO_MESSAGES: Array<{ text: string; groupName: string; groupId: string }> = [
  {
    text: 'Cần xe 4c từ Nội Bài về Cầu Giấy 14h chiều nay 300k sđt 0987654321',
    groupName: 'Bắn Kèo Xe Sân Bay Nội Bài 24/7',
    groupId: 'grp_noibai_247',
  },
  {
    text: 'Tiện chuyến 7 chỗ Hải Phòng -> Giáp Bát sáng mai 8h, khách bao xe 1.2tr. Lh 0912345678',
    groupName: 'Lái Xe Tiện Chuyến HN - Hải Phòng - Quảng Ninh',
    groupId: 'grp_hn_hp_qn',
  },
  {
    text: 'NB -> Mỹ Đình xe 4c 3 lốp đón ngay 15h ai ăn k 0968112233',
    groupName: 'Bắn Kèo Xe Sân Bay Nội Bài 24/7',
    groupId: 'grp_noibai_247',
  },
  {
    text: 'Khách ghép 1 người từ KĐT Ecopark sang Bệnh viện 108 trước 9h sáng, giá 120k, ib zalo 0905123456',
    groupName: 'Hội Xe Ghép & Tiện Chuyến Hà Nội - Miền Bắc',
    groupId: 'grp_hn_mienbac',
  },
  {
    text: 'Tìm xe 4c đón 19h tại Sân bay TSN về Vũng Tàu, 700k bao trọn gói, zalo 0978999888',
    groupName: 'Kèo Xe Ghép Sài Gòn - Vũng Tàu - Biên Hoà',
    groupId: 'grp_sg_vungtau',
  },
  {
    text: 'Cần gấp xe 7 chỗ Fortuner từ TP Bắc Ninh sang Sân bay Nội Bài đón lúc 16h30 giá 450k gọi 0988223344',
    groupName: 'Hội Xe Ghép Bắc Ninh - Bắc Giang - Nội Bài',
    groupId: 'grp_bn_bg_nb',
  },
  {
    text: 'Sân bay Nội Bài về Thanh Xuân xe 4 chỗ đón 17h, giá 350k bao vé, gọi ngay 0936778899',
    groupName: 'Bắn Kèo Xe Sân Bay Nội Bài 24/7',
    groupId: 'grp_noibai_247',
  },
  {
    text: 'Bao xe 7c Sài Gòn -> Biên Hoà tối nay đón 20h 400k gọi 0918776655',
    groupName: 'Kèo Xe Ghép Sài Gòn - Vũng Tàu - Biên Hoà',
    groupId: 'grp_sg_vungtau',
  },
  {
    text: 'Xe ghép 2 người + 2 vali từ Bãi Cháy Hạ Long về Gia Lâm Hà Nội trưa mai 11h, giá 250k/người sđt 0945678901',
    groupName: 'Lái Xe Tiện Chuyến HN - Hải Phòng - Quảng Ninh',
    groupId: 'grp_hn_hp_qn',
  },
  {
    text: 'Cần 1 xe 4c đón tại Times City đi Sân bay Nội Bài 5h sáng mai, giá 250k alo 0972111222',
    groupName: 'Bắn Kèo Xe Sân Bay Nội Bài 24/7',
    groupId: 'grp_noibai_247',
  },
  {
    text: 'Bắn kèo gấp: Big C Thăng Long đi Bắc Giang 4 chỗ 600k đón luôn bây giờ lh 0989333444',
    groupName: 'Hội Xe Ghép Bắc Ninh - Bắc Giang - Nội Bài',
    groupId: 'grp_bn_bg_nb',
  },
  {
    text: 'Khách cần xe 7 chỗ từ Sân bay Tân Sơn Nhất về Bến Tre lúc 18h, giá 1.1tr liên hệ 0903889900',
    groupName: 'Xe Sân Bay Tân Sơn Nhất - Miền Tây',
    groupId: 'grp_tsn_mientay',
  },
  {
    text: 'Tiện chuyến xe 4 chỗ từ Hà Đông đi Sân bay Nội Bài 300k lúc 13h chiều nay ai nhận k 0966445566',
    groupName: 'Bắn Kèo Xe Sân Bay Nội Bài 24/7',
    groupId: 'grp_noibai_247',
  },
  {
    text: 'Cần xe máy giao hàng hỏa tốc từ Cầu Giấy sang Long Biên tiền ship 80k nhận hàng ngay sđt 0915998877',
    groupName: 'Hội Xe Ghép & Tiện Chuyến Hà Nội - Miền Bắc',
    groupId: 'grp_hn_mienbac',
  },
  {
    text: 'Vũng Tàu -> Sài Gòn Q1 đón lúc 14h xe 4c 650k bao xe ai nhận ib 0938112244',
    groupName: 'Kèo Xe Ghép Sài Gòn - Vũng Tàu - Biên Hoà',
    groupId: 'grp_sg_vungtau',
  },
  {
    text: 'Bán bảo hiểm TNDS ô tô xe máy chiết khấu cao 30%, freeship tận nơi liên hệ 0999000111',
    groupName: 'Hội Xe Ghép & Tiện Chuyến Hà Nội - Miền Bắc',
    groupId: 'grp_hn_mienbac',
  },
];
