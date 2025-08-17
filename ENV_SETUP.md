# إعداد المتغيرات البيئية

## إنشاء ملف .env
أنشئ ملف `.env` في المجلد الرئيسي للمشروع:

```env
# JWT Secret Key
JWT_SECRET=your-secret-key-here

# Server Port
PORT=8080

# Ngrok URL (تحديث هذا عند تشغيل ngrok)
NGROK_URL=https://your-ngrok-url.ngrok.io

# Socket URL (للاختبار المحلي)
SOCKET_URL=http://localhost:8080
```

## المتغيرات المطلوبة

### JWT_SECRET
- **الوصف**: مفتاح سري لتوقيع JWT tokens
- **مثال**: `JWT_SECRET=my-super-secret-key-123`

### PORT
- **الوصف**: منفذ السيرفر
- **افتراضي**: `8080`
- **مثال**: `PORT=3000`

### NGROK_URL
- **الوصف**: رابط ngrok للاتصال الخارجي
- **مثال**: `NGROK_URL=https://abc123.ngrok.io`

### SOCKET_URL
- **الوصف**: رابط السيرفر المحلي
- **افتراضي**: `http://localhost:8080`
- **مثال**: `SOCKET_URL=http://localhost:3000`

## ملاحظات مهمة
- لا تشارك ملف `.env` في Git
- تأكد من أن JWT_SECRET قوي وآمن
- تحديث NGROK_URL في كل مرة تعيد تشغيل ngrok
