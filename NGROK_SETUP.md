# دليل إعداد ngrok للاتصال بالسوكيت

## المشكلة
لا يمكن الاتصال بالسوكيت عبر ngrok بسبب إعدادات CORS.

## الحل
تم تحديث إعدادات CORS في `src/server.js` للسماح بعناوين ngrok.

## خطوات التشغيل

### 1. تشغيل السيرفر
```bash
npm start
# أو
npm run dev
```

### 2. تشغيل ngrok (في terminal منفصل)
```bash
npm run ngrok
```

### 3. نسخ رابط ngrok
ستظهر رسالة مثل:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:8080
```

انسخ الرابط `https://abc123.ngrok.io`

### 4. اختبار الاتصال
```bash
# تعيين رابط ngrok كمتغير بيئي
export NGROK_URL="https://abc123.ngrok.io"

# تشغيل الاختبار
npm run test-ngrok
```

## استخدام الرابط في التطبيق

### في ملف .env
```env
NGROK_URL=https://abc123.ngrok.io
```

### في الكود
```javascript
const socket = io(process.env.NGROK_URL, {
  auth: { token },
  transports: ["websocket", "polling"]
});
```

## استكشاف الأخطاء

### إذا لم يعمل الاتصال:
1. تأكد من أن السيرفر يعمل على المنفذ 8080
2. تأكد من أن ngrok يعمل بشكل صحيح
3. تأكد من أن رابط ngrok صحيح
4. تحقق من إعدادات CORS في السيرفر

### رسائل الخطأ الشائعة:
- `CORS error`: تأكد من إعدادات CORS
- `Connection timeout`: تأكد من أن السيرفر يعمل
- `Invalid token`: تأكد من JWT_SECRET

## ملاحظات مهمة
- رابط ngrok يتغير في كل مرة تعيد تشغيل ngrok
- تأكد من تحديث الرابط في التطبيق عند تغييره
- يمكن استخدام ngrok للاختبار فقط، وليس للإنتاج
