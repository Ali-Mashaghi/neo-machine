# سیستم مدیریت سفارش‌ها - نئوماشین

سیستم جامع مدیریت سفارش‌های خدمات تراشکاری و ماشین‌کاری با رابط کاربری پیشرفته و ذخیره‌سازی ایمن در پایگاه داده.

## 🎯 ویژگی‌های اصلی

- ✅ **مدیریت سفارش‌ها**: ایجاد، بررسی و ویرایش سفارش‌ها
- ✅ **مدیریت خدمات**: پشتیبانی از خدمات مختلف (CNC تراشکاری، CNC فرزکاری، Anodizing، Laser hack)
- ✅ **سیستم حساب کاربری**: ورود، ثبت‌نام و مدیریت پروفایل
- ✅ **پنل داشبورد**: نمایش آمار و آخرین سفارش‌ها
- ✅ **مرتب‌سازی و جستجو**: جستجو و مرتب‌سازی سفارش‌ها بر اساس معیارهای مختلف
- ✅ **API RESTful**: API برای دسترسی برنامه‌ای به داده‌ها
- ✅ **محیط Docker**: استقرار آسان با Docker Compose

## 🛠 فناوری‌های استفاده‌شده

- **Backend**: Django 6.0.5
- **Database**: PostgreSQL 17
- **API**: Django REST Framework
- **Frontend**: HTML5, CSS3, JavaScript
- **Containerization**: Docker & Docker Compose
- **Python**: 3.13

## 📋 پیش‌نیازها

- Docker و Docker Compose نصب شده
- حداقل 2GB فضای خالی روی سیستم

## 🚀 نحوه راه‌اندازی

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd neo-machine
```

### 2. اجرا با Docker Compose

```bash
docker compose up --build
```

این دستور:
- تصویر Docker را ساخت می‌کند
- پایگاه داده PostgreSQL را راه‌اندازی می‌کند
- سرور Django را در پورت 8000 اجرا می‌کند
- تمام مایگریشن‌ها را اعمال می‌کند

### 3. دسترسی به اپلیکیشن

```
http://localhost:8000
```

### 4. ایجاد حساب مدیر

```bash
docker compose exec web python manage.py createsuperuser
```

سپس مستقیم در:
```
http://localhost:8000/admin
```

وارد شوید.

## 📁 ساختار پروژه

```
neo-machine/
├── accounts/              # اپ حساب کاربری
│   ├── models.py         # مدل‌های کاربری
│   ├── views.py          # نماها
│   ├── serializer.py     # Serializers API
│   └── migrations/       # مایگریشن‌های پایگاه داده
│
├── order/                # اپ سفارش‌ها
│   ├── models.py         # مدل‌های سفارش و خدمات
│   ├── views.py          # نماها و API
│   ├── serializer.py     # Serializers
│   ├── api/              # API endpoints
│   └── migrations/       # مایگریشن‌ها
│
├── core/                 # تنظیمات اصلی Django
│   ├── settings.py       # تنظیمات پروژه
│   ├── urls.py           # روتینگ URL اصلی
│   ├── wsgi.py           # WSGI entry point
│   └── asgi.py           # ASGI entry point
│
├── templates/            # الگوهای HTML
│   ├── home.html
│   ├── login.html
│   ├── panel.html
│   └── order_detail.html
│
├── static/               # فایل‌های استاتیک
│   ├── css/
│   ├── js/
│   └── images/
│
├── media/                # فایل‌های آپلود شده
│   └── orders/
│
├── docker-compose.yml    # پیکربندی Docker Compose
├── dockerfile            # Dockerfile برای اپلیکیشن
├── manage.py             # مدیر Django
└── requirements.txt      # وابستگی‌های Python
```

## 🔧 دستورات مفید

### اجرای مایگریشن‌ها

```bash
docker compose exec web python manage.py migrate
```

### ایجاد مایگریشن‌های جدید

```bash
docker compose exec web python manage.py makemigrations
```

### دسترسی به شل Django

```bash
docker compose exec web python manage.py shell
```

### مشاهده لاگ‌ها

```bash
docker compose logs -f web
```

### متوقف کردن کانتینرها

```bash
docker compose down
```

### حذف تمام داده‌ها

```bash
docker compose down -v
```

## 📊 مدل‌های پایگاه داده

### Service
خدمات موجود برای سفارش‌ها:
- CNC تراشکاری
- CNC فرزکاری
- Anodizing
- Laser hack

### OrderModel
جدول سفارش‌ها با اطلاعات:
- نام مشتری
- شماره تماس
- نوع خدمت
- تعداد قطعه
- توضیحات اضافی
- وضعیت سفارش
- تاریخ ایجاد و بروزرسانی

### User (Accounts)
اطلاعات کاربر:
- نام کاربری
- رمز عبور
- پروفایل کاربر

## 🌐 Endpoints اصلی

### صفحات وب
- `/` - صفحه اصلی
- `/accounts/login/` - صفحه ورود
- `/accounts/profile/` - پروفایل کاربر
- `/panel/` - پنل مدیریت سفارش‌ها
- `/order/<id>/` - جزئیات سفارش

### API (REST)
- `GET /api/orders/` - لیست تمام سفارش‌ها
- `POST /api/orders/` - ایجاد سفارش جدید
- `GET /api/orders/<id>/` - جزئیات سفارش
- `PUT /api/orders/<id>/` - بروزرسانی سفارش
- `DELETE /api/orders/<id>/` - حذف سفارش

## 🔒 امنیت

- CSRF Protection فعال
- Session-based Authentication
- پسورد رمزگذاری شده
- متغیرهای محیطی برای داده‌های حساس

## 🐛 عیب‌یابی

### خطای "relation "order_ordermodel" does not exist"
```bash
docker compose exec web python manage.py migrate
```

### پاک کردن کش‌ها
```bash
docker compose exec web python manage.py clear_cache
```

### بروزرسانی فایل‌های استاتیک
```bash
docker compose exec web python manage.py collectstatic --noinput
```

## 📝 توسعه‌دهندگان

برای مساهمه در پروژه:

1. یک شاخه جدید ایجاد کنید
2. تغییرات خود را انجام دهید
3. Pull Request ارسال کنید

## 📞 پشتیبانی

برای سوالات و مشکلات، لطفا issue ایجاد کنید.

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

---

**توسعه‌دهنده**: تیم توسعه نئوماشین  
**آخرین بروزرسانی**: ۱۴۰۵/۰۳/۱۱  
**ورژن**: ۱.۰.۰
