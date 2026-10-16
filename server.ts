import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store recent webhook trips in memory
const webhookTrips: Array<{
  id: string;
  groupName: string;
  senderName?: string;
  message: string;
  timestamp: number;
}> = [];

// 1. Webhook endpoint for external Zalo extensions / Bots / Automation tools
app.post('/api/zalo-webhook', (req: Request, res: Response) => {
  const { groupName, senderName, message, text } = req.body;
  const rawMessage = message || text || '';

  if (!rawMessage) {
    return res.status(400).json({ success: false, error: 'Thiếu trường "message" hoặc "text"' });
  }

  const newEntry = {
    id: 'webhook_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    groupName: groupName || 'Nhóm Zalo Webhook',
    senderName: senderName || 'Thành viên',
    message: rawMessage,
    timestamp: Date.now(),
  };

  webhookTrips.unshift(newEntry);
  if (webhookTrips.length > 100) webhookTrips.pop();

  return res.json({
    success: true,
    message: 'Đã nhận tin nhắn Zalo thành công!',
    data: newEntry,
  });
});

// 2. Endpoint to fetch received webhook messages
app.get('/api/zalo-webhook/messages', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: webhookTrips.length,
    messages: webhookTrips,
  });
});

// 3. Serve static production assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// 4. SPA fallback: serve index.html for any unhandled routes
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server ZaloRide Radar đang chạy tại: http://localhost:${PORT}`);
});
