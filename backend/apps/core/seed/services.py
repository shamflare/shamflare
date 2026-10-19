"""The four core services (published) plus Hosting (draft, not public)."""

PUBLISHED = "published"
DRAFT = "draft"

SERVICES = [
    # ------------------------------------------------------------------ #
    {
        "key": "website-development",
        "icon": "globe",
        "status": PUBLISHED,
        "is_featured": True,
        "sort_order": 1,
        "translations": {
            "en": {
                "title": "Website Development",
                "slug": "website-development",
                "summary": (
                    "Fast, accessible and search-friendly websites and web applications — from company "
                    "sites to custom online platforms."
                ),
                "description": """Your website is often the first place people meet your business. We build websites and web applications that load quickly, work well on every screen size, are easy for search engines to understand and are simple for your team to keep up to date.

Whether you need a clear company website, a multilingual content site or a custom web application with user accounts and integrations, we plan the structure around your audience and your goals, then build it on a maintainable, well-documented foundation.""",
                "capabilities": [
                    "Company and marketing websites",
                    "Custom web applications and customer portals",
                    "Content management so your team can edit pages",
                    "Multilingual sites, including right-to-left languages",
                    "Online booking, forms and e-commerce features",
                    "Integrations with payment, email and third-party APIs",
                    "Performance, accessibility and technical SEO foundations",
                ],
                "use_cases": [
                    "Launching a professional website for a new business",
                    "Replacing an outdated site that is slow or hard to update",
                    "Building a portal where customers can log in and manage requests",
                    "Adding online booking or sales to an existing business",
                ],
                "process": [
                    {"title": "Discovery", "description": "We clarify your goals, audience, content and required features, and agree on scope and priorities."},
                    {"title": "Structure and design", "description": "We plan the page structure and user journeys, then design an interface that fits your brand."},
                    {"title": "Development", "description": "We build in short iterations, sharing working previews so you can give feedback early."},
                    {"title": "Launch and handover", "description": "We test, deploy, set up monitoring and show your team how to manage content."},
                ],
                "seo_title": "Website Development | Shamflare",
                "seo_description": "Fast, accessible, search-friendly websites and web applications built on a maintainable foundation by Shamflare.",
            },
            "tr": {
                "title": "Web Sitesi Geliştirme",
                "slug": "web-sitesi-gelistirme",
                "summary": (
                    "Kurumsal sitelerden özel çevrim içi platformlara kadar hızlı, erişilebilir ve arama "
                    "motoru dostu web siteleri ve web uygulamaları."
                ),
                "description": """Web siteniz, insanların işletmenizle ilk karşılaştığı yer olabilir. Hızlı açılan, her ekran boyutunda düzgün çalışan, arama motorlarının kolayca anlayabildiği ve ekibinizin kolayca güncel tutabildiği web siteleri ve web uygulamaları geliştiriyoruz.

İhtiyacınız sade bir kurumsal site, çok dilli bir içerik sitesi ya da kullanıcı hesapları ve entegrasyonlar içeren özel bir web uygulaması olsun; yapıyı hedef kitlenize ve hedeflerinize göre planlıyor, ardından sürdürülebilir ve iyi belgelenmiş bir temel üzerine inşa ediyoruz.""",
                "capabilities": [
                    "Kurumsal ve tanıtım web siteleri",
                    "Özel web uygulamaları ve müşteri portalları",
                    "Ekibinizin sayfaları düzenleyebileceği içerik yönetimi",
                    "Sağdan sola yazılan diller dahil çok dilli siteler",
                    "Çevrim içi randevu, formlar ve e-ticaret özellikleri",
                    "Ödeme, e-posta ve üçüncü taraf API entegrasyonları",
                    "Performans, erişilebilirlik ve teknik SEO altyapısı",
                ],
                "use_cases": [
                    "Yeni bir işletme için profesyonel bir web sitesi yayına almak",
                    "Yavaş ya da güncellemesi zor, eskimiş bir siteyi yenilemek",
                    "Müşterilerin giriş yapıp taleplerini yönetebildiği bir portal kurmak",
                    "Mevcut bir işletmeye çevrim içi randevu ya da satış eklemek",
                ],
                "process": [
                    {"title": "Keşif", "description": "Hedeflerinizi, hedef kitlenizi, içeriğinizi ve gerekli özellikleri netleştirir; kapsam ve öncelikler üzerinde uzlaşırız."},
                    {"title": "Yapı ve tasarım", "description": "Sayfa yapısını ve kullanıcı akışlarını planlar, ardından markanıza uygun bir arayüz tasarlarız."},
                    {"title": "Geliştirme", "description": "Kısa döngülerle geliştirir, erken geri bildirim verebilmeniz için çalışan önizlemeler paylaşırız."},
                    {"title": "Yayın ve teslim", "description": "Test eder, yayına alır, izlemeyi kurar ve ekibinize içeriği nasıl yöneteceğini gösteririz."},
                ],
                "seo_title": "Web Sitesi Geliştirme | Shamflare",
                "seo_description": "Shamflare'den sürdürülebilir bir altyapı üzerine kurulu, hızlı, erişilebilir ve arama motoru dostu web siteleri ve web uygulamaları.",
            },
            "ar": {
                "title": "تطوير مواقع الويب",
                "slug": "تطوير-مواقع-الويب",
                "summary": (
                    "مواقع وتطبيقات ويب سريعة وسهلة الوصول ومتوافقة مع محركات البحث، من المواقع التعريفية "
                    "للشركات إلى المنصات الإلكترونية المخصّصة."
                ),
                "description": """غالبًا ما يكون موقعك الإلكتروني أول مكان يتعرّف فيه الناس على عملك. نبني مواقع وتطبيقات ويب سريعة التحميل، تعمل جيدًا على جميع أحجام الشاشات، وتفهمها محركات البحث بسهولة، ويستطيع فريقك تحديثها دون عناء.

سواء احتجت إلى موقع تعريفي واضح لشركتك، أو موقع محتوى متعدد اللغات، أو تطبيق ويب مخصّص يتضمن حسابات مستخدمين وتكاملات مع أنظمة أخرى، فإننا نخطّط البنية بناءً على جمهورك وأهدافك، ثم نبنيها على أساس قابل للصيانة وموثّق جيدًا.""",
                "capabilities": [
                    "مواقع تعريفية وتسويقية للشركات",
                    "تطبيقات ويب مخصّصة وبوابات للعملاء",
                    "نظام لإدارة المحتوى يتيح لفريقك تعديل الصفحات",
                    "مواقع متعددة اللغات، بما فيها اللغات التي تُكتب من اليمين إلى اليسار",
                    "الحجز الإلكتروني والنماذج وميزات التجارة الإلكترونية",
                    "التكامل مع أنظمة الدفع والبريد الإلكتروني وواجهات برمجة التطبيقات الخارجية",
                    "أسس متينة للأداء وسهولة الوصول وتحسين محركات البحث التقني",
                ],
                "use_cases": [
                    "إطلاق موقع احترافي لنشاط تجاري جديد",
                    "استبدال موقع قديم بطيء أو يصعب تحديثه",
                    "بناء بوابة يسجّل فيها العملاء دخولهم ويتابعون طلباتهم",
                    "إضافة الحجز أو البيع الإلكتروني إلى نشاط تجاري قائم",
                ],
                "process": [
                    {"title": "الاستكشاف", "description": "نوضّح أهدافك وجمهورك والمحتوى والميزات المطلوبة، ونتّفق على النطاق والأولويات."},
                    {"title": "البنية والتصميم", "description": "نخطّط بنية الصفحات ومسارات المستخدم، ثم نصمّم واجهة تنسجم مع هويتك."},
                    {"title": "التطوير", "description": "نعمل على مراحل قصيرة ونشاركك نسخًا تجريبية عاملة لتبدي ملاحظاتك مبكرًا."},
                    {"title": "الإطلاق والتسليم", "description": "نختبر الموقع وننشره ونُعدّ أدوات المراقبة، ونشرح لفريقك كيفية إدارة المحتوى."},
                ],
                "seo_title": "تطوير مواقع الويب | Shamflare",
                "seo_description": "مواقع وتطبيقات ويب سريعة وسهلة الوصول ومتوافقة مع محركات البحث، مبنية على أساس قابل للصيانة من Shamflare.",
            },
        },
    },
    # ------------------------------------------------------------------ #
    {
        "key": "mobile-app-development",
        "icon": "smartphone",
        "status": PUBLISHED,
        "is_featured": True,
        "sort_order": 2,
        "translations": {
            "en": {
                "title": "Mobile App Development",
                "slug": "mobile-app-development",
                "summary": (
                    "iOS and Android apps that feel natural to use, work reliably on real-world "
                    "connections and connect securely to your systems."
                ),
                "description": """A good mobile app earns its place on someone's phone by being genuinely useful. We design and build apps for iOS and Android that are fast, intuitive and dependable — including on slow or unreliable connections.

We help you decide between cross-platform and native development based on your requirements and budget, design the backend and APIs the app depends on, and take care of the details of publishing to the App Store and Google Play.""",
                "capabilities": [
                    "Cross-platform apps for iOS and Android",
                    "Native development where the requirements call for it",
                    "Backend services and APIs for your app",
                    "User accounts, notifications and in-app messaging",
                    "Offline support and data synchronization",
                    "App Store and Google Play publishing",
                ],
                "use_cases": [
                    "Giving your customers a convenient way to book, order or track",
                    "Equipping field staff with an app for checklists and reports",
                    "Turning a validated idea into a first product release",
                    "Extending an existing web platform with a companion app",
                ],
                "process": [
                    {"title": "Product definition", "description": "We define the core user journeys, the first release scope and how the app will be measured."},
                    {"title": "Prototype and design", "description": "We create an interactive prototype to validate flows before investing in development."},
                    {"title": "Build and test", "description": "We develop the app and its backend in iterations and test on real devices."},
                    {"title": "Release and iterate", "description": "We handle store submission, monitor stability after launch and plan the next improvements."},
                ],
                "seo_title": "Mobile App Development | Shamflare",
                "seo_description": "Reliable iOS and Android apps with secure backends, designed and built by Shamflare from prototype to store release.",
            },
            "tr": {
                "title": "Mobil Uygulama Geliştirme",
                "slug": "mobil-uygulama-gelistirme",
                "summary": (
                    "Kullanımı doğal gelen, gerçek hayattaki bağlantı koşullarında güvenilir şekilde çalışan "
                    "ve sistemlerinize güvenle bağlanan iOS ve Android uygulamaları."
                ),
                "description": """İyi bir mobil uygulama, gerçekten işe yaradığı için telefonlarda yerini korur. iOS ve Android için hızlı, sezgisel ve güvenilir uygulamalar tasarlıyor ve geliştiriyoruz; yavaş ya da kesintili bağlantılarda bile.

İhtiyaçlarınıza ve bütçenize göre çapraz platform ile yerel (native) geliştirme arasında karar vermenize yardımcı oluyor, uygulamanın dayandığı sunucu tarafını ve API'leri tasarlıyor, App Store ve Google Play yayın sürecinin ayrıntılarını üstleniyoruz.""",
                "capabilities": [
                    "iOS ve Android için çapraz platform uygulamalar",
                    "Gereksinimlerin gerektirdiği durumlarda yerel (native) geliştirme",
                    "Uygulamanız için sunucu servisleri ve API'ler",
                    "Kullanıcı hesapları, bildirimler ve uygulama içi mesajlaşma",
                    "Çevrim dışı kullanım ve veri senkronizasyonu",
                    "App Store ve Google Play yayın süreci",
                ],
                "use_cases": [
                    "Müşterilerinize randevu, sipariş ya da takip için pratik bir yol sunmak",
                    "Saha ekiplerine kontrol listeleri ve raporlar için bir uygulama sağlamak",
                    "Doğrulanmış bir fikri ilk ürün sürümüne dönüştürmek",
                    "Mevcut bir web platformunu tamamlayıcı bir uygulamayla genişletmek",
                ],
                "process": [
                    {"title": "Ürün tanımı", "description": "Temel kullanıcı akışlarını, ilk sürümün kapsamını ve uygulamanın başarısının nasıl ölçüleceğini belirleriz."},
                    {"title": "Prototip ve tasarım", "description": "Geliştirmeye yatırım yapmadan önce akışları doğrulamak için etkileşimli bir prototip hazırlarız."},
                    {"title": "Geliştirme ve test", "description": "Uygulamayı ve sunucu tarafını döngüler halinde geliştirir, gerçek cihazlarda test ederiz."},
                    {"title": "Yayın ve iyileştirme", "description": "Mağaza başvurularını yönetir, yayın sonrası kararlılığı izler ve sonraki iyileştirmeleri planlarız."},
                ],
                "seo_title": "Mobil Uygulama Geliştirme | Shamflare",
                "seo_description": "Shamflare'den prototipten mağaza yayınına kadar güvenli altyapıya sahip, güvenilir iOS ve Android uygulamaları.",
            },
            "ar": {
                "title": "تطوير تطبيقات الجوال",
                "slug": "تطوير-تطبيقات-الجوال",
                "summary": (
                    "تطبيقات لنظامَي iOS وAndroid سهلة الاستخدام، تعمل بثبات في ظروف الاتصال الفعلية، "
                    "وتتصل بأنظمتك بأمان."
                ),
                "description": """يحجز التطبيق الجيد مكانه على هاتف المستخدم لأنه مفيد حقًا. نصمّم ونطوّر تطبيقات لنظامَي iOS وAndroid تتميّز بالسرعة وسهولة الاستخدام والاعتمادية، حتى مع الاتصال البطيء أو المتقطّع.

نساعدك على الاختيار بين التطوير متعدد المنصات والتطوير الأصلي (Native) وفقًا لمتطلباتك وميزانيتك، ونصمّم الخوادم وواجهات البرمجة التي يعتمد عليها التطبيق، ونتولّى تفاصيل النشر على App Store وGoogle Play.""",
                "capabilities": [
                    "تطبيقات متعددة المنصات لنظامَي iOS وAndroid",
                    "تطوير أصلي (Native) عندما تتطلّب المتطلبات ذلك",
                    "خدمات خلفية وواجهات برمجة تطبيقات لتطبيقك",
                    "حسابات المستخدمين والإشعارات والمراسلة داخل التطبيق",
                    "العمل دون اتصال ومزامنة البيانات",
                    "النشر على App Store وGoogle Play",
                ],
                "use_cases": [
                    "منح عملائك وسيلة سهلة للحجز أو الطلب أو المتابعة",
                    "تزويد الفرق الميدانية بتطبيق لقوائم التحقق والتقارير",
                    "تحويل فكرة تم التحقق منها إلى إصدار أول من المنتج",
                    "توسيع منصة ويب قائمة بتطبيق جوال مرافق",
                ],
                "process": [
                    {"title": "تعريف المنتج", "description": "نحدّد مسارات المستخدم الأساسية ونطاق الإصدار الأول وطريقة قياس نجاح التطبيق."},
                    {"title": "النموذج الأولي والتصميم", "description": "ننشئ نموذجًا أوليًا تفاعليًا للتحقق من المسارات قبل الاستثمار في التطوير."},
                    {"title": "التطوير والاختبار", "description": "نطوّر التطبيق وخدماته الخلفية على مراحل ونختبره على أجهزة حقيقية."},
                    {"title": "الإطلاق والتحسين", "description": "نتولّى تقديم التطبيق إلى المتاجر، ونراقب استقراره بعد الإطلاق، ونخطّط للتحسينات التالية."},
                ],
                "seo_title": "تطوير تطبيقات الجوال | Shamflare",
                "seo_description": "تطبيقات موثوقة لنظامَي iOS وAndroid مع خدمات خلفية آمنة، من النموذج الأولي حتى النشر في المتاجر مع Shamflare.",
            },
        },
    },
    # ------------------------------------------------------------------ #
    {
        "key": "desktop-application-development",
        "icon": "monitor",
        "status": PUBLISHED,
        "is_featured": True,
        "sort_order": 3,
        "translations": {
            "en": {
                "title": "Desktop Application Development",
                "slug": "desktop-application-development",
                "summary": (
                    "Robust desktop software for Windows, macOS and Linux — for work that needs local "
                    "performance, offline use or deep system integration."
                ),
                "description": """Some work is best done in a dedicated desktop application: handling large files, working offline, connecting to local hardware or giving power users a fast, focused tool. We build desktop software that is stable, responsive and straightforward to install and update.

We also modernize existing desktop tools — improving their interface, moving fragile parts to a maintainable codebase and connecting them to cloud services where that makes sense.""",
                "capabilities": [
                    "Cross-platform desktop apps for Windows, macOS and Linux",
                    "Internal business tools and data-entry applications",
                    "Offline-first software with local databases",
                    "Integration with printers, scanners and other local devices",
                    "Synchronization with web services and APIs",
                    "Installers and automatic updates",
                ],
                "use_cases": [
                    "Replacing spreadsheets with a dedicated internal tool",
                    "Software that must keep working without an internet connection",
                    "Modernizing an older desktop application that is hard to maintain",
                    "Processing large local files faster than a browser allows",
                ],
                "process": [
                    {"title": "Workflow analysis", "description": "We observe how the work is done today and identify what the software must make faster or safer."},
                    {"title": "Architecture", "description": "We choose the platform, data storage and update strategy that fit your environment."},
                    {"title": "Iterative development", "description": "We deliver usable builds regularly so the people who will use the tool can try it early."},
                    {"title": "Deployment and support", "description": "We package installers, plan rollout and support your team after release."},
                ],
                "seo_title": "Desktop Application Development | Shamflare",
                "seo_description": "Stable, responsive desktop applications for Windows, macOS and Linux, including offline-first and internal business tools, by Shamflare.",
            },
            "tr": {
                "title": "Masaüstü Uygulama Geliştirme",
                "slug": "masaustu-uygulama-gelistirme",
                "summary": (
                    "Yerel performans, çevrim dışı kullanım ya da sistemle derin entegrasyon gerektiren "
                    "işler için Windows, macOS ve Linux'ta sağlam masaüstü yazılımlar."
                ),
                "description": """Bazı işler en iyi özel bir masaüstü uygulamasıyla yapılır: büyük dosyalarla çalışmak, çevrim dışı kalmak, yerel donanıma bağlanmak ya da yoğun kullanıcılara hızlı ve odaklı bir araç sunmak gibi. Kararlı, akıcı, kurulumu ve güncellemesi kolay masaüstü yazılımlar geliştiriyoruz.

Mevcut masaüstü araçlarını da modernleştiriyoruz: arayüzlerini iyileştiriyor, kırılgan bölümleri sürdürülebilir bir kod tabanına taşıyor ve mantıklı olduğu yerlerde bulut servislerine bağlıyoruz.""",
                "capabilities": [
                    "Windows, macOS ve Linux için çapraz platform masaüstü uygulamalar",
                    "Şirket içi araçlar ve veri giriş uygulamaları",
                    "Yerel veritabanıyla çevrim dışı öncelikli yazılımlar",
                    "Yazıcı, tarayıcı ve diğer yerel cihazlarla entegrasyon",
                    "Web servisleri ve API'lerle senkronizasyon",
                    "Kurulum paketleri ve otomatik güncellemeler",
                ],
                "use_cases": [
                    "Elektronik tabloların yerine işe özel bir şirket içi araç kullanmak",
                    "İnternet bağlantısı olmadan da çalışması gereken yazılımlar",
                    "Bakımı zorlaşmış eski bir masaüstü uygulamasını modernleştirmek",
                    "Büyük yerel dosyaları tarayıcının izin verdiğinden daha hızlı işlemek",
                ],
                "process": [
                    {"title": "İş akışı analizi", "description": "İşin bugün nasıl yapıldığını inceler, yazılımın neyi daha hızlı ya da daha güvenli hale getirmesi gerektiğini belirleriz."},
                    {"title": "Mimari", "description": "Ortamınıza uygun platformu, veri depolama yöntemini ve güncelleme stratejisini seçeriz."},
                    {"title": "Döngüsel geliştirme", "description": "Aracı kullanacak kişilerin erkenden deneyebilmesi için düzenli olarak kullanılabilir sürümler teslim ederiz."},
                    {"title": "Dağıtım ve destek", "description": "Kurulum paketlerini hazırlar, geçişi planlar ve yayın sonrasında ekibinize destek veririz."},
                ],
                "seo_title": "Masaüstü Uygulama Geliştirme | Shamflare",
                "seo_description": "Shamflare'den Windows, macOS ve Linux için kararlı ve akıcı masaüstü uygulamalar; çevrim dışı çalışan çözümler ve şirket içi araçlar.",
            },
            "ar": {
                "title": "تطوير تطبيقات سطح المكتب",
                "slug": "تطوير-تطبيقات-سطح-المكتب",
                "summary": (
                    "برمجيات سطح مكتب متينة لأنظمة Windows وmacOS وLinux، للأعمال التي تحتاج إلى أداء "
                    "محلي أو عمل دون اتصال أو تكامل عميق مع النظام."
                ),
                "description": """بعض الأعمال يُنجَز على أفضل وجه في تطبيق سطح مكتب مخصّص: كالتعامل مع الملفات الكبيرة، أو العمل دون اتصال بالإنترنت، أو الاتصال بالأجهزة المحلية، أو منح المستخدمين المتقدّمين أداة سريعة ومركّزة. نبني برمجيات سطح مكتب مستقرة وسريعة الاستجابة وسهلة التثبيت والتحديث.

كما نحدّث أدوات سطح المكتب القائمة، فنحسّن واجهاتها، وننقل أجزاءها الهشّة إلى شيفرة قابلة للصيانة، ونربطها بالخدمات السحابية حيث يكون ذلك مفيدًا.""",
                "capabilities": [
                    "تطبيقات سطح مكتب متعددة المنصات لأنظمة Windows وmacOS وLinux",
                    "أدوات داخلية للأعمال وتطبيقات إدخال البيانات",
                    "برمجيات تعمل دون اتصال بالاعتماد على قواعد بيانات محلية",
                    "التكامل مع الطابعات والماسحات الضوئية والأجهزة المحلية الأخرى",
                    "المزامنة مع خدمات الويب وواجهات برمجة التطبيقات",
                    "حزم التثبيت والتحديثات التلقائية",
                ],
                "use_cases": [
                    "استبدال جداول البيانات بأداة داخلية مخصّصة",
                    "برمجيات يجب أن تستمر في العمل دون اتصال بالإنترنت",
                    "تحديث تطبيق سطح مكتب قديم أصبحت صيانته صعبة",
                    "معالجة الملفات المحلية الكبيرة بسرعة تفوق ما يتيحه المتصفح",
                ],
                "process": [
                    {"title": "تحليل سير العمل", "description": "ندرس طريقة إنجاز العمل حاليًا ونحدّد ما يجب أن تجعله البرمجية أسرع أو أكثر أمانًا."},
                    {"title": "البنية التقنية", "description": "نختار المنصة وطريقة تخزين البيانات واستراتيجية التحديث الأنسب لبيئة عملك."},
                    {"title": "التطوير على مراحل", "description": "نسلّم إصدارات قابلة للاستخدام بانتظام ليجرّبها المستخدمون الفعليون مبكرًا."},
                    {"title": "النشر والدعم", "description": "نُعدّ حزم التثبيت، ونخطّط لعملية الانتقال، وندعم فريقك بعد الإطلاق."},
                ],
                "seo_title": "تطوير تطبيقات سطح المكتب | Shamflare",
                "seo_description": "تطبيقات سطح مكتب مستقرة وسريعة لأنظمة Windows وmacOS وLinux، بما فيها الأدوات الداخلية والبرمجيات التي تعمل دون اتصال، من Shamflare.",
            },
        },
    },
    # ------------------------------------------------------------------ #
    {
        "key": "technical-support-maintenance",
        "icon": "wrench",
        "status": PUBLISHED,
        "is_featured": True,
        "sort_order": 4,
        "translations": {
            "en": {
                "title": "Technical Support & Maintenance",
                "slug": "technical-support-and-maintenance",
                "summary": (
                    "Keep your software secure, up to date and running smoothly — with troubleshooting, "
                    "updates and improvements when you need them."
                ),
                "description": """Software needs care after launch. Dependencies age, security issues are discovered, browsers and operating systems change, and your business needs evolve. We keep your websites and applications healthy so problems are prevented rather than discovered by your customers.

We can support software we built as well as existing systems built by others. We start with a review of the current state, agree on priorities with you and then provide ongoing maintenance or targeted fixes.""",
                "capabilities": [
                    "Troubleshooting and bug fixing",
                    "Security and dependency updates",
                    "Performance analysis and optimization",
                    "Monitoring, backups and recovery planning",
                    "Code and infrastructure reviews of existing systems",
                    "Small feature improvements and ongoing development",
                ],
                "use_cases": [
                    "A website or app that has become slow or unstable",
                    "Software whose original developer is no longer available",
                    "Keeping a system secure and current without an in-house team",
                    "Preparing an older application for new requirements",
                ],
                "process": [
                    {"title": "Assessment", "description": "We review the code, infrastructure and known issues to understand risks and priorities."},
                    {"title": "Stabilization", "description": "We address the most urgent problems first: security, critical bugs and missing backups."},
                    {"title": "Ongoing care", "description": "We apply updates, monitor health and handle support requests on an agreed schedule."},
                    {"title": "Continuous improvement", "description": "We recommend and implement improvements that reduce long-term cost and risk."},
                ],
                "seo_title": "Technical Support & Maintenance | Shamflare",
                "seo_description": "Troubleshooting, security updates, monitoring and ongoing maintenance for websites and applications, by Shamflare.",
            },
            "tr": {
                "title": "Teknik Destek ve Bakım",
                "slug": "teknik-destek-ve-bakim",
                "summary": (
                    "Yazılımınızı güvenli, güncel ve sorunsuz çalışır halde tutun; ihtiyaç duyduğunuzda "
                    "sorun giderme, güncelleme ve iyileştirmelerle."
                ),
                "description": """Yazılım, yayına alındıktan sonra da özen ister. Bağımlılıklar eskir, güvenlik açıkları ortaya çıkar, tarayıcılar ve işletim sistemleri değişir, işletmenizin ihtiyaçları gelişir. Web sitelerinizi ve uygulamalarınızı sağlıklı tutarak sorunların müşterileriniz tarafından fark edilmesini değil, önceden önlenmesini sağlıyoruz.

Kendi geliştirdiğimiz yazılımların yanı sıra başkaları tarafından geliştirilmiş mevcut sistemlere de destek verebiliriz. Mevcut durumu inceleyerek başlar, önceliklerde sizinle uzlaşır ve ardından sürekli bakım ya da hedefe yönelik düzeltmeler sağlarız.""",
                "capabilities": [
                    "Sorun giderme ve hata düzeltme",
                    "Güvenlik ve bağımlılık güncellemeleri",
                    "Performans analizi ve optimizasyon",
                    "İzleme, yedekleme ve kurtarma planlaması",
                    "Mevcut sistemlerin kod ve altyapı incelemesi",
                    "Küçük özellik iyileştirmeleri ve sürekli geliştirme",
                ],
                "use_cases": [
                    "Yavaşlamış ya da kararsız çalışan bir web sitesi veya uygulama",
                    "İlk geliştiricisine artık ulaşılamayan bir yazılım",
                    "Şirket içi bir ekip olmadan sistemi güvenli ve güncel tutmak",
                    "Eski bir uygulamayı yeni gereksinimlere hazırlamak",
                ],
                "process": [
                    {"title": "Değerlendirme", "description": "Riskleri ve öncelikleri anlamak için kodu, altyapıyı ve bilinen sorunları inceleriz."},
                    {"title": "Stabilizasyon", "description": "Önce en acil sorunları ele alırız: güvenlik, kritik hatalar ve eksik yedekler."},
                    {"title": "Sürekli bakım", "description": "Güncellemeleri uygular, sistemin sağlığını izler ve destek taleplerini üzerinde anlaştığımız takvimle yanıtlarız."},
                    {"title": "Sürekli iyileştirme", "description": "Uzun vadeli maliyeti ve riski azaltan iyileştirmeleri önerir ve hayata geçiririz."},
                ],
                "seo_title": "Teknik Destek ve Bakım | Shamflare",
                "seo_description": "Shamflare'den web siteleri ve uygulamalar için sorun giderme, güvenlik güncellemeleri, izleme ve sürekli bakım hizmeti.",
            },
            "ar": {
                "title": "الدعم الفني والصيانة",
                "slug": "الدعم-الفني-والصيانة",
                "summary": (
                    "حافظ على برمجياتك آمنة ومحدّثة وتعمل بسلاسة، مع تشخيص المشكلات وإصلاحها والتحديثات "
                    "والتحسينات متى احتجت إليها."
                ),
                "description": """تحتاج البرمجيات إلى رعاية بعد إطلاقها. فالمكتبات تتقادم، وتُكتشف ثغرات أمنية جديدة، وتتغيّر المتصفحات وأنظمة التشغيل، وتتطوّر احتياجات عملك. نحافظ على سلامة مواقعك وتطبيقاتك بحيث تُمنع المشكلات مسبقًا بدل أن يكتشفها عملاؤك.

يمكننا دعم البرمجيات التي طوّرناها، وكذلك الأنظمة القائمة التي طوّرها آخرون. نبدأ بمراجعة الوضع الحالي، ونتّفق معك على الأولويات، ثم نقدّم صيانة مستمرة أو إصلاحات محدّدة الهدف.""",
                "capabilities": [
                    "تشخيص المشكلات وإصلاح الأعطال",
                    "تحديثات الأمان والمكتبات البرمجية",
                    "تحليل الأداء وتحسينه",
                    "المراقبة والنسخ الاحتياطي وخطط الاستعادة",
                    "مراجعة الشيفرة والبنية التحتية للأنظمة القائمة",
                    "تحسينات صغيرة على الميزات وتطوير مستمر",
                ],
                "use_cases": [
                    "موقع أو تطبيق أصبح بطيئًا أو غير مستقر",
                    "برمجية لم يعد مطوّرها الأصلي متاحًا",
                    "الحفاظ على أمان النظام وتحديثه دون فريق تقني داخلي",
                    "تهيئة تطبيق قديم لمتطلبات جديدة",
                ],
                "process": [
                    {"title": "التقييم", "description": "نراجع الشيفرة والبنية التحتية والمشكلات المعروفة لفهم المخاطر والأولويات."},
                    {"title": "تحقيق الاستقرار", "description": "نعالج المشكلات الأكثر إلحاحًا أولًا: الأمان والأعطال الحرجة والنسخ الاحتياطية الناقصة."},
                    {"title": "الرعاية المستمرة", "description": "نطبّق التحديثات ونراقب سلامة النظام ونستجيب لطلبات الدعم وفق جدول متّفق عليه."},
                    {"title": "التحسين المستمر", "description": "نقترح وننفّذ تحسينات تقلّل التكلفة والمخاطر على المدى الطويل."},
                ],
                "seo_title": "الدعم الفني والصيانة | Shamflare",
                "seo_description": "تشخيص المشكلات وتحديثات الأمان والمراقبة والصيانة المستمرة لمواقع الويب والتطبيقات من Shamflare.",
            },
        },
    },
    # ------------------------------------------------------------------ #
    # Future service: kept as a DRAFT so it is never shown publicly until an
    # administrator completes and publishes it.
    {
        "key": "hosting",
        "icon": "server",
        "status": DRAFT,
        "is_featured": False,
        "sort_order": 5,
        "translations": {
            "en": {
                "title": "Hosting",
                "slug": "hosting",
                "summary": "Managed hosting for websites and applications. Not yet available.",
                "description": "",
                "status": DRAFT,
            },
        },
    },
]
