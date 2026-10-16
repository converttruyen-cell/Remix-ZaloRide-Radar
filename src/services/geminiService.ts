import { GoogleGenAI } from '@google/genai';
import { Trip, VehicleType } from '../types/trip';
import { TripParser } from './tripParser';

// Check for available key from environment
const API_KEY = 
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY) ||
  '';

export class GeminiService {
  private static client: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (!API_KEY) return null;
    if (!this.client) {
      try {
        this.client = new GoogleGenAI({ apiKey: API_KEY });
      } catch {
        this.client = null;
      }
    }
    return this.client;
  }

  public static hasApiKey(): boolean {
    return Boolean(API_KEY);
  }

  /**
   * Deep parse unstructured Vietnamese message using Gemini 2.5 Flash
   */
  public static async parseWithGemini(rawText: string, groupName: string): Promise<Trip> {
    const fallbackTrip = TripParser.parseRawMessage(rawText, groupName);

    const client = this.getClient();
    if (!client) {
      return fallbackTrip;
    }

    try {
      const prompt = `Bạn là hệ thống trích xuất thông tin cuốc xe từ tin nhắn Zalo của các hội nhóm lái xe tại Việt Nam.
Hãy phân tích tin nhắn sau và trả về DUY NHẤT một chuỗi JSON hợp lệ không có markdown backticks:

Tin nhắn Zalo: "${rawText}"

Định dạng JSON yêu cầu:
{
  "pickup": "Điểm đón (ví dụ: Sân bay Nội Bài, Cầu Giấy, Hà Nội)",
  "destination": "Điểm đến (ví dụ: TP Bắc Ninh, Vũng Tàu)",
  "vehicleType": "Một trong các giá trị: 4_cho, 7_cho, xe_ghep, bao_xe, xe_may, bat_ky",
  "vehicleTypeLabel": "Tên loại xe (ví dụ: Xe 4 chỗ, Xe 7 chỗ, Xe ghép)",
  "price": Số tiền số nguyên VNĐ hoặc null nếu thoả thuận (ví dụ: 300000, 1200000),
  "priceText": "Cách hiển thị giá (ví dụ: 300k, 1.2 triệu, Thoả thuận)",
  "pickupTime": "Thời gian đón (ví dụ: 14h chiều nay, Đón gấp ngay)",
  "phoneNumber": "Số điện thoại nếu có (ví dụ: 0987654321) hoặc null",
  "notes": "Ghi chú thêm nếu có (ví dụ: 2 vali, bao cầu đường) hoặc rỗng",
  "isUrgent": true/false
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        ...fallbackTrip,
        pickup: parsed.pickup || fallbackTrip.pickup,
        destination: parsed.destination || fallbackTrip.destination,
        vehicleType: (parsed.vehicleType as VehicleType) || fallbackTrip.vehicleType,
        vehicleTypeLabel: parsed.vehicleTypeLabel || fallbackTrip.vehicleTypeLabel,
        price: typeof parsed.price === 'number' ? parsed.price : fallbackTrip.price,
        priceText: parsed.priceText || fallbackTrip.priceText,
        pickupTime: parsed.pickupTime || fallbackTrip.pickupTime,
        phoneNumber: parsed.phoneNumber || fallbackTrip.phoneNumber,
        notes: parsed.notes || fallbackTrip.notes,
        isUrgent: Boolean(parsed.isUrgent) || fallbackTrip.isUrgent,
      };
    } catch {
      // Return fast local regex parser output if AI fails
      return fallbackTrip;
    }
  }
}
