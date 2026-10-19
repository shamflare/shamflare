"""Clearly labeled demonstration projects (no clients, no results claimed)."""

PROJECTS = [
    {
        "category": "website-development",
        "services": ["website-development", "technical-support-maintenance"],
        "technologies": ["Next.js", "TypeScript", "Django", "PostgreSQL"],
        "is_featured": True,
        "is_demo": True,
        "sort_order": 1,
        "translations": {
            "en": {
                "title": "Clinic Appointment Booking (Demonstration Project)",
                "slug": "clinic-booking-demo",
                "summary": (
                    "A demonstration of an online booking flow for a small clinic: choosing a service, "
                    "picking an available time and receiving a confirmation."
                ),
                "body": """> **Demonstration project.** Shamflare created this concept to illustrate how we approach this kind of product. It is not work for a real client and no real patient data is involved.

## The scenario

A small clinic takes appointments by phone. Staff spend a large part of the day answering calls, and patients can only book during opening hours. The goal of this concept is to let patients book online at any time, while staff keep full control of the schedule.

## What the demonstration covers

- A multilingual public website with clear service and practitioner information
- A booking flow: choose a service, see available slots, confirm with name and contact details
- A staff view to manage working hours, block time and review upcoming appointments
- Confirmation and reminder messages through a pluggable notification interface

## Technical approach

The public site is rendered on the server for speed and search visibility. A Django REST API manages availability and bookings in PostgreSQL, and prevents double booking with database-level constraints. Personal data is kept to the minimum needed to manage an appointment.""",
                "cover_alt": "Interface concept of a clinic appointment booking screen",
                "seo_title": "Clinic Appointment Booking — Demonstration Project | Shamflare",
                "seo_description": "A Shamflare demonstration project showing an online appointment booking flow for a small clinic.",
            },
            "tr": {
                "title": "Klinik Randevu Sistemi (Demo Proje)",
                "slug": "klinik-randevu-demo",
                "summary": (
                    "Küçük bir klinik için çevrim içi randevu akışını gösteren bir demo: hizmet seçimi, "
                    "uygun saatin belirlenmesi ve onay alınması."
                ),
                "body": """> **Demo proje.** Shamflare bu konsepti, bu tür bir ürüne nasıl yaklaştığımızı göstermek için hazırladı. Gerçek bir müşteri için yapılmış bir çalışma değildir ve gerçek hasta verisi içermez.

## Senaryo

Küçük bir klinik randevuları telefonla alıyor. Personel günün önemli bir bölümünü telefonlara yanıt vererek geçiriyor ve hastalar yalnızca mesai saatlerinde randevu alabiliyor. Bu konseptin amacı, personel takvim üzerinde tam kontrolü korurken hastaların istedikleri zaman çevrim içi randevu alabilmesini sağlamaktır.

## Demonun kapsamı

- Hizmetler ve uzmanlar hakkında net bilgi sunan çok dilli bir web sitesi
- Randevu akışı: hizmeti seçme, uygun saatleri görme, ad ve iletişim bilgileriyle onaylama
- Personelin çalışma saatlerini yönetebildiği, saatleri kapatabildiği ve yaklaşan randevuları görebildiği bir ekran
- Değiştirilebilir bir bildirim altyapısı üzerinden onay ve hatırlatma mesajları

## Teknik yaklaşım

Hız ve arama motoru görünürlüğü için genel site sunucu tarafında oluşturulur. Bir Django REST API, uygunluk ve randevu bilgilerini PostgreSQL'de yönetir ve veritabanı düzeyindeki kısıtlamalarla çift randevuyu engeller. Kişisel veriler, randevuyu yönetmek için gereken en az düzeyde tutulur.""",
                "cover_alt": "Klinik randevu ekranının arayüz konsepti",
                "seo_title": "Klinik Randevu Sistemi — Demo Proje | Shamflare",
                "seo_description": "Küçük bir klinik için çevrim içi randevu akışını gösteren Shamflare demo projesi.",
            },
            "ar": {
                "title": "نظام حجز مواعيد العيادة (مشروع توضيحي)",
                "slug": "عرض-توضيحي-حجز-مواعيد-العيادة",
                "summary": (
                    "عرض توضيحي لمسار حجز إلكتروني لعيادة صغيرة: اختيار الخدمة، وتحديد موعد متاح، "
                    "ثم استلام التأكيد."
                ),
                "body": """> **مشروع توضيحي.** أعدّت Shamflare هذا التصوّر لتوضيح طريقتنا في التعامل مع هذا النوع من المنتجات. وهو ليس عملًا منفّذًا لعميل حقيقي، ولا يتضمن أي بيانات حقيقية للمرضى.

## السيناريو

تستقبل عيادة صغيرة الحجوزات عبر الهاتف، فيقضي الموظفون جزءًا كبيرًا من يومهم في الرد على المكالمات، ولا يستطيع المرضى الحجز إلا خلال ساعات الدوام. يهدف هذا التصوّر إلى تمكين المرضى من الحجز إلكترونيًا في أي وقت، مع احتفاظ الموظفين بالتحكم الكامل في الجدول.

## ما يغطيه العرض التوضيحي

- موقع عام متعدد اللغات يعرض معلومات واضحة عن الخدمات والأطباء
- مسار الحجز: اختيار الخدمة، وعرض المواعيد المتاحة، والتأكيد بالاسم وبيانات التواصل
- واجهة للموظفين لإدارة ساعات العمل وحجب الأوقات ومراجعة المواعيد القادمة
- رسائل تأكيد وتذكير عبر واجهة إشعارات قابلة للاستبدال

## النهج التقني

تُعرض صفحات الموقع العام من جهة الخادم لتحقيق السرعة وتحسين الظهور في محركات البحث. وتدير واجهة برمجية مبنية بـ Django REST المواعيد المتاحة والحجوزات في قاعدة بيانات PostgreSQL، وتمنع الحجز المزدوج بقيود على مستوى قاعدة البيانات. ولا تُجمع من البيانات الشخصية إلا ما يلزم لإدارة الموعد.""",
                "cover_alt": "تصوّر لواجهة شاشة حجز مواعيد في عيادة",
                "seo_title": "نظام حجز مواعيد العيادة — مشروع توضيحي | Shamflare",
                "seo_description": "مشروع توضيحي من Shamflare يعرض مسار حجز مواعيد إلكتروني لعيادة صغيرة.",
            },
        },
    },
    {
        "category": "mobile-app-development",
        "services": ["mobile-app-development"],
        "technologies": ["React Native", "TypeScript", "Django REST Framework", "SQLite"],
        "is_featured": True,
        "is_demo": True,
        "sort_order": 2,
        "translations": {
            "en": {
                "title": "Field Service Checklist App (Demonstration Project)",
                "slug": "field-service-app-demo",
                "summary": (
                    "A demonstration mobile app that lets technicians complete inspection checklists, "
                    "attach photos and submit reports — even without a connection."
                ),
                "body": """> **Demonstration project.** Shamflare created this concept to illustrate how we approach offline-capable mobile apps. It is not work for a real client.

## The scenario

Technicians visit sites where mobile coverage is weak. Paper checklists are slow to fill in, easy to lose and have to be typed up again at the office. This concept replaces them with a mobile app designed for unreliable connections.

## What the demonstration covers

- Assigned jobs with addresses, contact details and required checklists
- Step-by-step checklists with photos, notes and signatures
- Full offline operation with automatic synchronization when a connection returns
- A simple web view where supervisors review submitted reports

## Technical approach

The app is built with React Native so one codebase serves iOS and Android. Data is stored locally in SQLite and synchronized with a Django REST API using conflict-aware updates. Photos are compressed on the device before upload to save data and battery.""",
                "cover_alt": "Mobile screens of a field service inspection checklist",
                "seo_title": "Field Service Checklist App — Demonstration Project | Shamflare",
                "seo_description": "A Shamflare demonstration of an offline-capable mobile app for field inspection checklists and reports.",
            },
            "tr": {
                "title": "Saha Servis Kontrol Listesi Uygulaması (Demo Proje)",
                "slug": "saha-servis-uygulamasi-demo",
                "summary": (
                    "Teknisyenlerin kontrol listelerini doldurmasını, fotoğraf eklemesini ve raporlarını "
                    "göndermesini sağlayan demo mobil uygulama; bağlantı olmasa bile."
                ),
                "body": """> **Demo proje.** Shamflare bu konsepti, çevrim dışı çalışabilen mobil uygulamalara nasıl yaklaştığımızı göstermek için hazırladı. Gerçek bir müşteri için yapılmış bir çalışma değildir.

## Senaryo

Teknisyenler mobil kapsamanın zayıf olduğu sahalara gidiyor. Kâğıt kontrol listelerini doldurmak zaman alıyor, kaybolabiliyorlar ve ofiste yeniden bilgisayara girilmeleri gerekiyor. Bu konsept, kâğıt listelerin yerine kesintili bağlantılar için tasarlanmış bir mobil uygulama koyuyor.

## Demonun kapsamı

- Adres, iletişim bilgileri ve gerekli kontrol listeleriyle atanmış işler
- Fotoğraf, not ve imza eklenebilen adım adım kontrol listeleri
- Bağlantı geri geldiğinde otomatik senkronizasyonla tamamen çevrim dışı çalışma
- Yöneticilerin gönderilen raporları inceleyebildiği basit bir web ekranı

## Teknik yaklaşım

Uygulama React Native ile geliştirildiği için tek bir kod tabanı hem iOS hem Android'e hizmet eder. Veriler cihazda SQLite ile saklanır ve çakışmaları dikkate alan güncellemelerle bir Django REST API'ye senkronize edilir. Veri ve pil tasarrufu için fotoğraflar yüklenmeden önce cihazda sıkıştırılır.""",
                "cover_alt": "Saha servis kontrol listesinin mobil ekranları",
                "seo_title": "Saha Servis Kontrol Listesi Uygulaması — Demo Proje | Shamflare",
                "seo_description": "Saha kontrol listeleri ve raporları için çevrim dışı çalışabilen bir mobil uygulamayı gösteren Shamflare demo projesi.",
            },
            "ar": {
                "title": "تطبيق قوائم التحقق للخدمة الميدانية (مشروع توضيحي)",
                "slug": "عرض-توضيحي-تطبيق-الخدمة-الميدانية",
                "summary": (
                    "تطبيق جوال توضيحي يتيح للفنيين إكمال قوائم الفحص وإرفاق الصور وإرسال التقارير، "
                    "حتى دون اتصال بالإنترنت."
                ),
                "body": """> **مشروع توضيحي.** أعدّت Shamflare هذا التصوّر لتوضيح طريقتنا في بناء تطبيقات الجوال القادرة على العمل دون اتصال. وهو ليس عملًا منفّذًا لعميل حقيقي.

## السيناريو

يزور الفنيون مواقع تضعف فيها تغطية شبكة الجوال. وتعبئة قوائم التحقق الورقية بطيئة، وقد تضيع بسهولة، ثم يجب إدخالها مجددًا في المكتب. يستبدل هذا التصوّر تلك القوائم بتطبيق جوال مصمّم للعمل مع الاتصال غير المستقر.

## ما يغطيه العرض التوضيحي

- مهام مُسندة تتضمن العناوين وبيانات التواصل وقوائم التحقق المطلوبة
- قوائم تحقق خطوة بخطوة مع الصور والملاحظات والتوقيعات
- عمل كامل دون اتصال مع مزامنة تلقائية عند عودة الاتصال
- واجهة ويب بسيطة يراجع فيها المشرفون التقارير المرسلة

## النهج التقني

بُني التطبيق باستخدام React Native لتخدم شيفرة واحدة نظامَي iOS وAndroid. وتُخزَّن البيانات محليًا في SQLite وتُزامَن مع واجهة برمجية مبنية بـ Django REST عبر تحديثات تراعي التعارضات. وتُضغط الصور على الجهاز قبل رفعها لتوفير البيانات والبطارية.""",
                "cover_alt": "شاشات جوال لقائمة تحقق خاصة بالفحص الميداني",
                "seo_title": "تطبيق قوائم التحقق للخدمة الميدانية — مشروع توضيحي | Shamflare",
                "seo_description": "مشروع توضيحي من Shamflare لتطبيق جوال يعمل دون اتصال لقوائم الفحص الميداني والتقارير.",
            },
        },
    },
    {
        "category": "desktop-application-development",
        "services": ["desktop-application-development"],
        "technologies": ["Python", "Qt (PySide6)", "SQLite"],
        "is_featured": True,
        "is_demo": True,
        "sort_order": 3,
        "translations": {
            "en": {
                "title": "Workshop Inventory Desktop Tool (Demonstration Project)",
                "slug": "inventory-desktop-tool-demo",
                "summary": (
                    "A demonstration desktop application for tracking parts and stock levels in a small "
                    "workshop, with barcode scanning and printable labels."
                ),
                "body": """> **Demonstration project.** Shamflare created this concept to illustrate how we approach internal desktop tools. It is not work for a real client.

## The scenario

A small workshop tracks parts in a shared spreadsheet. Entries get overwritten, nobody is sure which version is current and low stock is noticed too late. This concept replaces the spreadsheet with a focused desktop tool.

## What the demonstration covers

- A searchable parts catalog with locations, suppliers and minimum stock levels
- Stock movements recorded with a USB barcode scanner
- Low-stock warnings and a simple reorder list
- Printable labels and CSV export for accounting

## Technical approach

The tool is a Python application with a Qt interface, packaged as a standard installer for Windows, macOS and Linux. Data lives in a local SQLite database with automatic backups, and the design leaves room for synchronizing with a web service later.""",
                "cover_alt": "Desktop window showing a parts inventory table",
                "seo_title": "Workshop Inventory Desktop Tool — Demonstration Project | Shamflare",
                "seo_description": "A Shamflare demonstration of a desktop inventory tool with barcode scanning and printable labels.",
            },
            "tr": {
                "title": "Atölye Stok Takip Masaüstü Aracı (Demo Proje)",
                "slug": "stok-takip-masaustu-demo",
                "summary": (
                    "Küçük bir atölyede parçaları ve stok seviyelerini takip etmek için barkod okuma ve "
                    "yazdırılabilir etiket özellikli demo masaüstü uygulaması."
                ),
                "body": """> **Demo proje.** Shamflare bu konsepti, şirket içi masaüstü araçlarına nasıl yaklaştığımızı göstermek için hazırladı. Gerçek bir müşteri için yapılmış bir çalışma değildir.

## Senaryo

Küçük bir atölye parçaları ortak bir elektronik tabloda takip ediyor. Kayıtların üzerine yazılıyor, hangi sürümün güncel olduğundan kimse emin olamıyor ve azalan stok çok geç fark ediliyor. Bu konsept, elektronik tablonun yerine işe odaklı bir masaüstü aracı koyuyor.

## Demonun kapsamı

- Konum, tedarikçi ve minimum stok bilgileriyle aranabilir bir parça kataloğu
- USB barkod okuyucuyla kaydedilen stok hareketleri
- Düşük stok uyarıları ve basit bir yeniden sipariş listesi
- Yazdırılabilir etiketler ve muhasebe için CSV dışa aktarımı

## Teknik yaklaşım

Araç, Qt arayüzüne sahip bir Python uygulamasıdır ve Windows, macOS ve Linux için standart bir kurulum paketi olarak sunulur. Veriler otomatik yedeklenen yerel bir SQLite veritabanında tutulur; tasarım, ileride bir web servisiyle senkronizasyona da olanak tanır.""",
                "cover_alt": "Parça stok tablosunu gösteren masaüstü penceresi",
                "seo_title": "Atölye Stok Takip Masaüstü Aracı — Demo Proje | Shamflare",
                "seo_description": "Barkod okuma ve yazdırılabilir etiket özellikli bir masaüstü stok takip aracını gösteren Shamflare demo projesi.",
            },
            "ar": {
                "title": "أداة سطح المكتب لإدارة مخزون الورشة (مشروع توضيحي)",
                "slug": "عرض-توضيحي-أداة-إدارة-المخزون",
                "summary": (
                    "تطبيق سطح مكتب توضيحي لتتبّع القطع ومستويات المخزون في ورشة صغيرة، مع قراءة "
                    "الباركود وطباعة الملصقات."
                ),
                "body": """> **مشروع توضيحي.** أعدّت Shamflare هذا التصوّر لتوضيح طريقتنا في بناء الأدوات الداخلية لسطح المكتب. وهو ليس عملًا منفّذًا لعميل حقيقي.

## السيناريو

تتابع ورشة صغيرة قطعها في جدول بيانات مشترك، فتُستبدل الإدخالات عن طريق الخطأ، ولا يعرف أحد على وجه اليقين أي نسخة هي الأحدث، ولا يُلاحَظ نقص المخزون إلا بعد فوات الأوان. يستبدل هذا التصوّر جدول البيانات بأداة سطح مكتب مركّزة.

## ما يغطيه العرض التوضيحي

- دليل قطع قابل للبحث يتضمن مواقع التخزين والموردين والحد الأدنى للمخزون
- تسجيل حركات المخزون باستخدام قارئ باركود يعمل عبر USB
- تنبيهات عند انخفاض المخزون وقائمة بسيطة لإعادة الطلب
- ملصقات قابلة للطباعة وتصدير بصيغة CSV لأغراض المحاسبة

## النهج التقني

الأداة تطبيق مكتوب بلغة Python بواجهة Qt، ويُوزَّع كحزمة تثبيت قياسية لأنظمة Windows وmacOS وLinux. وتُحفظ البيانات في قاعدة بيانات SQLite محلية مع نسخ احتياطي تلقائي، ويتيح التصميم إمكانية المزامنة مع خدمة ويب مستقبلًا.""",
                "cover_alt": "نافذة سطح مكتب تعرض جدولًا لمخزون القطع",
                "seo_title": "أداة سطح المكتب لإدارة مخزون الورشة — مشروع توضيحي | Shamflare",
                "seo_description": "مشروع توضيحي من Shamflare لأداة سطح مكتب لإدارة المخزون مع قراءة الباركود وطباعة الملصقات.",
            },
        },
    },
]
