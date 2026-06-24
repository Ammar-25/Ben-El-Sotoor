# بين السطور — Bayn Al-Sutoor Bookstore

موقع متجر كتب احترافي **متعدد الصفحات** (Multi-Page) بدون أي إطار عمل — HTML5،
CSS حديث، وJavaScript مُقسّم إلى وحدات. يدعم **العربية (RTL) والإنجليزية (LTR)**،
الوضع **الفاتح/الداكن**، ومبني على **طبقة خدمات** تسمح بالترحيل لاحقًا إلى قاعدة
بيانات أو Backend دون تغيير الواجهة.

---

## 🚀 التشغيل

الموقع يقرأ ملفات JSON عبر `fetch`، لذلك **يجب تشغيله عبر خادم محلي** (وليس فتح
الملف مباشرة بالمتصفح):

```bash
# داخل مجلد المشروع
python -m http.server 5500
# ثم افتح: http://localhost:5500/index.html
```

أو استخدم إضافة **Live Server** في VS Code.

---

## 🗂️ هيكل المشروع

```
bayna-al-sutoor/
├── index.html              الرئيسية
├── library.html            المكتبة (فلترة/ترتيب/بحث/تقسيم صفحات)
├── latest.html             أحدث الإصدارات (أسبوعي/شهري/سنوي)
├── categories.html         التصنيفات
├── authors.html            المؤلفون
├── author-details.html     صفحة مؤلف (?id=)
├── search.html             بحث متقدم (اقتراحات حيّة + فلاتر)
├── quiz.html               اختبار شخصية القارئ
├── subscriptions.html      خطط الاشتراك + مقارنة + FAQ
├── cart.html               السلة
├── login.html              دخول/تسجيل
├── profile.html            الحساب (مفضلة/تقييمات/تقدّم القراءة)
├── reviews.html            التقييمات + نموذج مراجعة
├── 404.html                صفحة الخطأ
│
├── assets/images/          الصور (books / authors / banners / ui)
├── css/                    global, navbar, footer, cards, forms, modal, responsive
│   └── pages/              home.css, inner.css
├── js/
│   ├── services/           طبقة الوصول للبيانات (data-client + 4 خدمات)
│   ├── language.js theme.js ui.js cart.js main.js
│   └── books.js authors.js search.js quiz.js subscriptions.js
├── data/                   books, authors, reviews, subscriptions (JSON)
└── translations/           ar.json, en.json
```

---

## 🧱 المعمارية (Service Layer)

الواجهة **لا تتعامل مع JSON مباشرة**. التسلسل:

```
UI  →  *Service  →  DataClient  →  (JSON اليوم / API غدًا)
```

- `js/services/data-client.js` — المكان **الوحيد** الذي يعرف مصدر البيانات.
  للترحيل إلى Backend: عدّل `fetchJson` هنا فقط ليشير إلى نقاط الـ API.
- `book-service.js` / `author-service.js` / `review-service.js` /
  `subscription-service.js` — عقود ثابتة (Stable Contracts) تستهلكها الواجهة.

> طالما حافظت على نفس أشكال البيانات (Contracts)، يمكن استبدال JSON بـ MySQL /
> PostgreSQL / SQL Server عبر Laravel أو ASP.NET Core أو Node دون لمس الواجهة.

---

## ✍️ كيف تعدّل المحتوى

| تريد أن… | عدّل الملف |
|---|---|
| **تضيف كتابًا** | `data/books.json` — انسخ كائنًا، أعطه `id` فريدًا، واضبط `authorId` لمؤلف موجود، وضع الغلاف في `assets/images/books/` |
| **تضيف مؤلفًا** | `data/authors.json` — `id` فريد، والصورة في `assets/images/authors/` |
| **تحدّث خطة اشتراك** | `data/subscriptions.json` (مزايا الخطة عبر `featureKeys` المرتبطة بالترجمة) |
| **تضيف/تعدّل نصًا ظاهرًا** | `translations/ar.json` و`translations/en.json` (نفس المفاتيح) |
| **تغيّر الألوان/الثيم** | متغيرات CSS في `css/global.css` (`:root` و`[data-theme="dark"]`) |
| **تستبدل الشعار** | استبدل `assets/images/ui/logo-placeholder.png` |

> **مهم:** كل النصوص الظاهرة تأتي من ملفات الترجمة عبر `data-i18n`. لا تكتب نصًا
> ثابتًا في HTML — أضف مفتاحًا في `ar.json` و`en.json` بدلًا من ذلك.

---

## 🖼️ نظام الصور

- كل الصور **Placeholder** مولّدة تلقائيًا. استبدلها بصورك بنفس المسار/الاسم.
- أي صورة مفقودة ترجع تلقائيًا إلى `assets/images/ui/book-placeholder.png` أو
  `author-placeholder.png` عبر معالج `onerror` (Graceful fallback).
- كل الصور تستخدم `loading="lazy"` لتحسين الأداء.

---

## ✨ الميزات

- **ثنائي اللغة** AR/EN مع تبديل فوري لكل النصوص واتجاه الصفحة (RTL/LTR).
- **ثيم فاتح/داكن** مع تبديل متحرك وحفظ التفضيل في `localStorage`.
- **نظام مفضلة** كامل مع عدّاد ومزامنة عبر الصفحات.
- **سلة تسوق** مع كميات وضريبة وملخص طلب.
- **بحث متقدم**: اقتراحات حيّة، عمليات بحث سابقة، تظليل الكلمات، حالات فارغة/تحميل.
- **اختبار شخصية القارئ** مع ترشيحات مخصّصة.
- **إمكانية وصول (A11y)**: روابط تخطٍّ، ARIA، حصر التركيز في النوافذ، تباين ألوان.
- **SEO**: عناوين/أوصاف فريدة، Open Graph، Twitter Cards، Canonical، Schema.org.

---

## 🔌 التقنيات

HTML5 دلالي · CSS (Grid/Flex/Variables/Glassmorphism) · Vanilla JS (ES Modules
pattern عبر IIFE) · لا تبعيات خارجية عدا خط Tajawal من Google Fonts.

© 2026 بين السطور — جميع الحقوق محفوظة.
