# دوري رمضان لكرة القدم

تطبيق عربي كامل لإدارة بطولة كرة قدم رمضانية باستخدام `Node.js` و`Express` و`EJS` و`TailwindCSS` و`Alpine.js` و`Prisma`.

المشروع الآن مجهز بطريقتين تشغيل:

- محليًا عبر `SQLite`
- على `Vercel Hobby` عبر `PostgreSQL`

## المزايا

- واجهة عربية بالكامل مع `RTL`.
- صفحات عامة للمباريات والمجموعات والأدوار الإقصائية والهدافين وصفحات الفرق.
- لوحة إدارة محمية بتسجيل دخول.
- إدارة الفرق واللاعبين والمباريات وهدافي كل مباراة.
- تحديث تلقائي لجدول الترتيب عند حفظ نتائج مباريات المجموعات.
- تحديث تلقائي لترتيب الهدافين من بيانات الأهداف المسجلة.
- بيانات تجريبية عربية جاهزة بعد التهيئة.
- متوافق مع `Vercel Hobby` باستخدام جلسات مبنية على `cookie-session`.
- الشعارات في لوحة الإدارة تعتمد على رابط صورة مباشر بدل الرفع المحلي.

## المتطلبات

- `Node.js 22` أو أحدث.
- `npm 10` أو أحدث.

## التثبيت

```bash
npm install
```

## التطوير المحلي

ملف البيئة المحلي الافتراضي يستخدم `SQLite`:

```bash
copy .env.example .env
```

ثم:

```bash
npm install
npm run db:migrate
npm run db:seed
```

## تهيئة قاعدة البيانات محليًا

1. نفّذ الهجرات:

```bash
npm run db:migrate
```

2. أضف البيانات التجريبية:

```bash
npm run db:seed
```

## بناء الواجهة

لبناء ملف CSS النهائي:

```bash
npm run build:css
```

أثناء التطوير يمكنك تشغيل المراقبة:

```bash
npm run dev:css
```

## تشغيل الخادم

وضع التطوير:

```bash
npm run dev
```

وضع التشغيل العادي:

```bash
npm start
```

التطبيق يعمل افتراضيًا على:

```text
http://localhost:3000
```

## الوصول إلى لوحة الإدارة

- رابط لوحة الإدارة: `http://localhost:3000/admin`
- اسم المستخدم الافتراضي: `admin`
- كلمة المرور الافتراضية: `ramadan2026`

## الاختبارات

يشغّل الأمر التالي قاعدة بيانات اختبار مستقلة ثم ينفذ اختبارات التكامل:

```bash
npm test
```

## النشر على Vercel Hobby

المشروع مهيأ للنشر على `Vercel` باستخدام:

- `api/index.js` كنقطة دخول serverless
- `vercel.json` لتوجيه كل الطلبات إلى Express
- `prisma/postgres/schema.prisma` كمخطط قاعدة بيانات الإنتاج
- `vercel-build` لبناء CSS وتوليد Prisma Client وتطبيق migrations

### ما تحتاجه قبل النشر

1. أنشئ قاعدة `PostgreSQL` مجانية مثل:
   - `Neon`
   - `Supabase`

2. أضف متغيرات البيئة في Vercel:

```text
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret
NODE_ENV=production
```

يمكنك استخدام المثال الموجود في:

```text
.env.vercel.example
```

3. اربط المشروع بـ Vercel وارفعه من GitHub.

### أمر البناء في Vercel

استخدم:

```text
npm run vercel-build
```

### ملاحظات النشر على Vercel

- لا يعتمد المشروع في Vercel على `SQLite`.
- لا يعتمد المشروع في Vercel على رفع ملفات محليًا.
- شعار الفريق في لوحة الإدارة يُحفظ كرابط مباشر لصورة.
- الملفات الثابتة تُقدَّم من مجلد `public/` مباشرة.

## هيكل المشروع

```text
api/
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
prisma/
  migrations/
  postgres/
  schema.prisma
  seed.js
public/
  css/
  images/
  js/
views/
  admin/
  layouts/
  pages/
  partials/
scripts/
tests/
vercel.json
server.js
```

## ملاحظات

- ملف `scripts/ensure-sqlite-db.js` يضمن إنشاء ملف SQLite قبل تشغيل أوامر Prisma.
- بيانات الهدافين تعتمد على مجموع أهداف اللاعبين المحفوظة لكل مباراة، ويجب أن يطابق مجموعها نتيجة المباراة عند الحفظ.
- ملف `prisma/schema.prisma` مخصص للتطوير المحلي على `SQLite`.
- ملف `prisma/postgres/schema.prisma` مخصص للنشر على `Vercel` باستخدام `PostgreSQL`.
