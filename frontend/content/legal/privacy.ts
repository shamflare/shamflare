import type { Locale } from "@/i18n/routing";

/*
 * Privacy Policy, one Markdown document per locale. It describes what the site
 * actually does — keep it in sync when data handling changes (new form fields,
 * analytics, cookies, email provider, hosting) and bump LEGAL_UPDATED.
 */

const en = `
This policy explains what personal data Shamflare collects when you visit **shamflare.com** or contact us, why we collect it, how long we keep it and what rights you have.

## Who we are

Shamflare ("we", "us") is a software development studio registered in Syria and currently operated online by its founders. We are responsible for the personal data described in this policy.

Contact for anything related to your data: **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**

## What we collect

### When you send us an inquiry

Through the form on our contact page we collect:

- your **name** and **email address** (required);
- your **company** name, the **service** you are interested in and your **budget range** (all optional);
- your **project description** and **preferred language**;
- your **consent** and the date and time of the inquiry.

To protect the form against spam and abuse we also store a **one-way, keyed hash of your IP address** — never the address itself — and your browser's **user-agent** (browser and device type).

Please do not include sensitive information such as passwords, payment details or health information in your description.

### When you browse the website

- **Server logs.** Like every website, our server automatically records technical information about each request: IP address, date and time, the page requested, browser type and the referring page.
- **Language cookie.** A single cookie, \`NEXT_LOCALE\`, remembers the language you chose. It contains only the language code and is deleted when you close your browser.
- **Theme preference.** If you switch between light and dark mode, your choice is saved in your browser's local storage (\`sf-theme\`). It stays on your device and is never sent to us.

We do **not** use analytics, advertising or tracking cookies, social-media pixels or third-party scripts that follow you across websites. Our fonts are served from our own server.

### When you contact us by WhatsApp or email

If you write to us on WhatsApp or by email, we receive the details you send there (such as your phone number or email address and your messages) and keep the correspondence as described below.

## Why we use your data

| Purpose | Legal basis |
|---|---|
| Replying to your inquiry and preparing a proposal | Your consent, and steps you ask us to take before a possible contract |
| Protecting the website against spam, abuse and attacks | Our legitimate interest in keeping the service secure |
| Meeting legal obligations, if any arise | Legal obligation |

We do **not** sell your data, use it for advertising, add you to a mailing list or make automated decisions about you.

## Who can access your data

- **Our team** — only the people who handle inquiries and projects.
- **Hetzner Online GmbH** (Germany) — hosts our servers and database. Your data is stored in data centres in Germany, in the European Union.
- **Microsoft** (Outlook / Hotmail) — our email provider. Notifications about new inquiries and our email correspondence are stored in our mailbox.
- **WhatsApp** (Meta) — only if you choose to contact us on WhatsApp. WhatsApp's own privacy policy applies to those messages.
- **Authorities** — only where we are legally required to disclose information.

## International access

Your data is stored in Germany. Our team works remotely and may access it from other countries, including Syria. Access always takes place over encrypted connections and is limited to the people who need it.

## How long we keep your data

| Data | Retention period |
|---|---|
| Inquiries that do not lead to a project | Deleted **6 months** after our last communication |
| Inquiries and correspondence with clients | For the duration of our work together, then as long as legal, tax or accounting obligations require |
| Server logs | A limited period for security and troubleshooting, then deleted automatically |
| Language cookie | Until you close your browser |
| Theme preference | On your device until you clear your browser data |

You can ask us to delete your inquiry earlier at any time.

## How we protect your data

- The whole website is served over encrypted HTTPS connections.
- IP addresses submitted with inquiries are stored only as a one-way hash.
- Our dashboard is limited to authorised team members, and sessions end automatically after 12 hours.
- Access to servers and backups is restricted to the people who maintain them.

No method of transmission or storage is completely secure, but we take reasonable measures to protect your data.

## Your rights

Wherever you live, you can ask us to:

- **access** the personal data we hold about you and receive a copy of it;
- **correct** data that is inaccurate or incomplete;
- **delete** your data;
- **restrict** or **object to** how we use it;
- **withdraw your consent** at any time — this does not affect processing that took place before.

Email **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**. We reply within **24 hours** and may ask you to confirm your identity first. If you live in a country with a data protection authority, such as a member state of the European Union, you also have the right to lodge a complaint with that authority.

## Children

Our website and services are intended for businesses and adults. We do not knowingly collect personal data from children under 16. If you believe a child has sent us their data, please contact us and we will delete it.

## Changes to this policy

When we change this policy we update the "Last updated" date at the top of this page. If a change is significant, we will highlight it here.

## Contact

Questions or requests about your data: **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**
`;

const ar = `
توضح هذه السياسة البيانات الشخصية التي تجمعها Shamflare عند زيارتك موقع **shamflare.com** أو تواصلك معنا، ولماذا نجمعها، ومدة احتفاظنا بها، والحقوق التي تملكها.

## من نحن

Shamflare ("نحن") استوديو لتطوير البرمجيات مسجّل في سوريا، ويديره مؤسسوه حالياً عبر الإنترنت. نحن المسؤولون عن البيانات الشخصية الموصوفة في هذه السياسة.

للتواصل في أي أمر يخص بياناتك: **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**

## ما البيانات التي نجمعها

### عند إرسال طلب إلينا

نجمع عبر النموذج في صفحة التواصل:

- **اسمك** و**بريدك الإلكتروني** (إلزاميان)؛
- اسم **شركتك**، و**الخدمة** التي تهمّك، و**نطاق ميزانيتك** (كلها اختيارية)؛
- **وصف مشروعك** و**لغتك المفضّلة**؛
- **موافقتك**، وتاريخ الطلب ووقته.

ولحماية النموذج من الرسائل المزعجة وإساءة الاستخدام نحفظ أيضاً **بصمة مشفّرة باتجاه واحد لعنوان IP الخاص بك** — ولا نحفظ العنوان نفسه أبداً — ونوع **متصفحك وجهازك** (user-agent).

نرجو ألا تضع في وصف المشروع معلومات حساسة مثل كلمات المرور أو بيانات الدفع أو المعلومات الصحية.

### عند تصفّح الموقع

- **سجلات الخادم.** كأي موقع إلكتروني، يسجّل خادمنا تلقائياً معلومات تقنية عن كل طلب: عنوان IP، والتاريخ والوقت، والصفحة المطلوبة، ونوع المتصفح، والصفحة التي جئت منها.
- **ملف تعريف ارتباط اللغة.** ملف واحد هو \`NEXT_LOCALE\` يتذكّر اللغة التي اخترتها. لا يحتوي إلا رمز اللغة، ويُحذف عند إغلاق المتصفح.
- **تفضيل المظهر.** إذا بدّلت بين الوضع الفاتح والداكن، يُحفظ اختيارك في التخزين المحلي لمتصفحك (\`sf-theme\`). يبقى على جهازك ولا يُرسل إلينا أبداً.

**لا** نستخدم أدوات تحليل الزيارات، ولا ملفات تعريف ارتباط إعلانية أو تتبّعية، ولا بكسلات وسائل التواصل الاجتماعي، ولا نصوصاً برمجية من جهات خارجية تتبّعك بين المواقع. والخطوط تُقدَّم من خادمنا نحن.

### عند التواصل معنا عبر واتساب أو البريد الإلكتروني

إذا راسلتنا عبر واتساب أو البريد الإلكتروني، تصلنا البيانات التي ترسلها هناك (مثل رقم هاتفك أو بريدك ورسائلك)، ونحتفظ بالمراسلات وفق ما هو موضّح أدناه.

## لماذا نستخدم بياناتك

| الغرض | الأساس القانوني |
|---|---|
| الرد على طلبك وإعداد عرض لمشروعك | موافقتك، والخطوات التي تطلبها منّا قبل أي عقد محتمل |
| حماية الموقع من الرسائل المزعجة وإساءة الاستخدام والهجمات | مصلحتنا المشروعة في الحفاظ على أمان الخدمة |
| الوفاء بالالتزامات القانونية إن وُجدت | الالتزام القانوني |

**لا** نبيع بياناتك، ولا نستخدمها للإعلانات، ولا نضيفك إلى قوائم بريدية، ولا نتخذ بشأنك قرارات آلية.

## من يمكنه الوصول إلى بياناتك

- **فريقنا** — الأشخاص الذين يتابعون الطلبات والمشاريع فقط.
- **Hetzner Online GmbH** (ألمانيا) — تستضيف خوادمنا وقاعدة بياناتنا. تُخزَّن بياناتك في مراكز بيانات في ألمانيا، داخل الاتحاد الأوروبي.
- **Microsoft** ‏(Outlook / Hotmail) — مزوّد بريدنا الإلكتروني. تُحفظ إشعارات الطلبات الجديدة ومراسلاتنا البريدية في صندوق بريدنا.
- **واتساب** (Meta) — فقط إذا اخترت التواصل معنا عبر واتساب، وتسري على تلك الرسائل سياسة خصوصية واتساب.
- **الجهات الرسمية** — فقط عندما يُلزمنا القانون بالإفصاح عن معلومات.

## الوصول من دول أخرى

تُخزَّن بياناتك في ألمانيا. يعمل فريقنا عن بُعد وقد يصل إليها من دول أخرى، منها سوريا. ويتم الوصول دائماً عبر اتصالات مشفّرة، ويقتصر على من يحتاج إليه.

## مدة الاحتفاظ ببياناتك

| البيانات | مدة الاحتفاظ |
|---|---|
| الطلبات التي لا تتحول إلى مشروع | تُحذف بعد **6 أشهر** من آخر تواصل بيننا |
| طلبات العملاء ومراسلاتهم | طوال مدة عملنا معاً، ثم بالقدر الذي تفرضه الالتزامات القانونية أو الضريبية أو المحاسبية |
| سجلات الخادم | مدة محدودة لأغراض الأمان ومعالجة الأعطال، ثم تُحذف تلقائياً |
| ملف تعريف ارتباط اللغة | حتى تغلق المتصفح |
| تفضيل المظهر | على جهازك حتى تمسح بيانات المتصفح |

يمكنك أن تطلب حذف طلبك قبل ذلك في أي وقت.

## كيف نحمي بياناتك

- يُقدَّم الموقع بالكامل عبر اتصالات HTTPS مشفّرة.
- تُحفظ عناوين IP المرافقة للطلبات كبصمة مشفّرة باتجاه واحد فقط.
- لوحة التحكم مقصورة على أعضاء الفريق المخوّلين، وتنتهي الجلسات تلقائياً بعد 12 ساعة.
- الوصول إلى الخوادم والنسخ الاحتياطية مقصور على من يتولّون صيانتها.

لا توجد وسيلة نقل أو تخزين آمنة تماماً، لكننا نتخذ إجراءات معقولة لحماية بياناتك.

## حقوقك

أينما كنت تقيم، يحق لك أن تطلب منّا:

- **الاطلاع** على البيانات الشخصية التي نحتفظ بها عنك والحصول على نسخة منها؛
- **تصحيح** البيانات غير الدقيقة أو الناقصة؛
- **حذف** بياناتك؛
- **تقييد** استخدامنا لها أو **الاعتراض** عليه؛
- **سحب موافقتك** في أي وقت — دون أن يؤثر ذلك على المعالجة التي تمت قبل السحب.

راسلنا على **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**. نرد خلال **24 ساعة**، وقد نطلب منك تأكيد هويتك أولاً. وإذا كنت تقيم في بلد فيه هيئة لحماية البيانات، كدول الاتحاد الأوروبي، فيحق لك أيضاً تقديم شكوى إلى تلك الهيئة.

## الأطفال

موقعنا وخدماتنا موجّهة للشركات والبالغين. لا نجمع عن قصد بيانات شخصية من أطفال دون 16 عاماً. وإذا اعتقدت أن طفلاً أرسل إلينا بياناته، فتواصل معنا وسنحذفها.

## التعديلات على هذه السياسة

عند تعديل هذه السياسة نحدّث تاريخ "آخر تحديث" في أعلى الصفحة. وإذا كان التعديل جوهرياً فسنبرزه هنا.

## التواصل

للأسئلة أو الطلبات المتعلقة ببياناتك: **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**
`;

const tr = `
Bu politika, **shamflare.com** sitesini ziyaret ettiğinizde veya bizimle iletişime geçtiğinizde Shamflare'in hangi kişisel verileri topladığını, bunları neden topladığını, ne kadar süre sakladığını ve hangi haklara sahip olduğunuzu açıklar.

## Biz kimiz

Shamflare ("biz"), Suriye'de kayıtlı ve şu anda kurucuları tarafından çevrim içi olarak yürütülen bir yazılım geliştirme stüdyosudur. Bu politikada açıklanan kişisel verilerden biz sorumluyuz.

Verilerinizle ilgili her konuda iletişim: **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**

## Hangi verileri topluyoruz

### Bize talep gönderdiğinizde

İletişim sayfamızdaki form aracılığıyla şunları topluyoruz:

- **adınız** ve **e-posta adresiniz** (zorunlu);
- **şirket** adınız, ilgilendiğiniz **hizmet** ve **bütçe aralığınız** (hepsi isteğe bağlı);
- **proje açıklamanız** ve **tercih ettiğiniz dil**;
- **onayınız** ile talebin tarihi ve saati.

Formu spam ve kötüye kullanıma karşı korumak için ayrıca **IP adresinizin tek yönlü, anahtarlı bir özetini (hash)** — adresin kendisini asla — ve tarayıcınızın **user-agent** bilgisini (tarayıcı ve cihaz türü) saklıyoruz.

Lütfen açıklamanıza parola, ödeme bilgisi veya sağlık bilgisi gibi hassas bilgiler eklemeyin.

### Siteyi gezdiğinizde

- **Sunucu kayıtları.** Her web sitesinde olduğu gibi sunucumuz her istekle ilgili teknik bilgileri otomatik olarak kaydeder: IP adresi, tarih ve saat, istenen sayfa, tarayıcı türü ve yönlendiren sayfa.
- **Dil çerezi.** Tek bir çerez, \`NEXT_LOCALE\`, seçtiğiniz dili hatırlar. Yalnızca dil kodunu içerir ve tarayıcınızı kapattığınızda silinir.
- **Tema tercihi.** Açık ve koyu mod arasında geçiş yaparsanız seçiminiz tarayıcınızın yerel depolamasına (\`sf-theme\`) kaydedilir. Cihazınızda kalır ve bize asla gönderilmez.

Analitik araçları, reklam veya takip çerezleri, sosyal medya pikselleri ya da sizi siteler arasında izleyen üçüncü taraf komut dosyaları **kullanmıyoruz**. Yazı tiplerimiz kendi sunucumuzdan sunulur.

### WhatsApp veya e-posta ile iletişime geçtiğinizde

Bize WhatsApp'tan veya e-postayla yazarsanız, orada gönderdiğiniz bilgileri (telefon numaranız veya e-posta adresiniz ve mesajlarınız gibi) alırız ve yazışmaları aşağıda açıklandığı şekilde saklarız.

## Verilerinizi neden kullanıyoruz

| Amaç | Hukuki dayanak |
|---|---|
| Talebinize yanıt vermek ve teklif hazırlamak | Onayınız ve olası bir sözleşme öncesinde talep ettiğiniz adımlar |
| Siteyi spam, kötüye kullanım ve saldırılara karşı korumak | Hizmeti güvende tutmaya yönelik meşru menfaatimiz |
| Ortaya çıkması hâlinde yasal yükümlülükleri yerine getirmek | Yasal yükümlülük |

Verilerinizi **satmıyoruz**, reklam için kullanmıyoruz, sizi bir e-posta listesine eklemiyoruz ve hakkınızda otomatik kararlar almıyoruz.

## Verilerinize kimler erişebilir

- **Ekibimiz** — yalnızca talepler ve projelerle ilgilenen kişiler.
- **Hetzner Online GmbH** (Almanya) — sunucularımızı ve veritabanımızı barındırır. Verileriniz Avrupa Birliği içinde, Almanya'daki veri merkezlerinde saklanır.
- **Microsoft** (Outlook / Hotmail) — e-posta sağlayıcımız. Yeni taleplerle ilgili bildirimler ve e-posta yazışmalarımız posta kutumuzda saklanır.
- **WhatsApp** (Meta) — yalnızca bizimle WhatsApp üzerinden iletişime geçmeyi seçerseniz. Bu mesajlara WhatsApp'ın kendi gizlilik politikası uygulanır.
- **Resmî makamlar** — yalnızca yasal olarak bilgi vermekle yükümlü olduğumuz durumlarda.

## Diğer ülkelerden erişim

Verileriniz Almanya'da saklanır. Ekibimiz uzaktan çalışır ve verilere Suriye dahil başka ülkelerden erişebilir. Erişim her zaman şifreli bağlantılar üzerinden gerçekleşir ve yalnızca ihtiyacı olan kişilerle sınırlıdır.

## Verilerinizi ne kadar saklıyoruz

| Veri | Saklama süresi |
|---|---|
| Projeye dönüşmeyen talepler | Son iletişimimizden **6 ay** sonra silinir |
| Müşterilerin talepleri ve yazışmaları | Birlikte çalıştığımız süre boyunca, ardından yasal, vergisel veya muhasebesel yükümlülüklerin gerektirdiği süre kadar |
| Sunucu kayıtları | Güvenlik ve hata giderme için sınırlı bir süre, ardından otomatik olarak silinir |
| Dil çerezi | Tarayıcınızı kapatana kadar |
| Tema tercihi | Tarayıcı verilerinizi temizleyene kadar cihazınızda |

Talebinizin daha önce silinmesini istediğiniz zaman isteyebilirsiniz.

## Verilerinizi nasıl koruyoruz

- Sitenin tamamı şifreli HTTPS bağlantıları üzerinden sunulur.
- Taleplerle birlikte gönderilen IP adresleri yalnızca tek yönlü bir özet olarak saklanır.
- Yönetim panelimiz yetkili ekip üyeleriyle sınırlıdır ve oturumlar 12 saat sonra otomatik olarak sona erer.
- Sunuculara ve yedeklere erişim, bunların bakımını yapan kişilerle sınırlıdır.

Hiçbir aktarım veya saklama yöntemi tamamen güvenli değildir, ancak verilerinizi korumak için makul önlemler alıyoruz.

## Haklarınız

Nerede yaşarsanız yaşayın, bizden şunları talep edebilirsiniz:

- hakkınızda tuttuğumuz kişisel verilere **erişmek** ve bir kopyasını almak;
- yanlış veya eksik verileri **düzeltmek**;
- verilerinizi **silmek**;
- verilerinizin kullanımını **kısıtlamak** veya buna **itiraz etmek**;
- **onayınızı** istediğiniz zaman **geri çekmek** — bu, geri çekmeden önce yapılan işlemleri etkilemez.

**[shamflare@hotmail.com](mailto:shamflare@hotmail.com)** adresine e-posta gönderin. **24 saat** içinde yanıt veririz ve önce kimliğinizi doğrulamanızı isteyebiliriz. Avrupa Birliği üye devletleri gibi bir veri koruma otoritesinin bulunduğu bir ülkede yaşıyorsanız, bu otoriteye şikâyette bulunma hakkınız da vardır.

## Çocuklar

Sitemiz ve hizmetlerimiz işletmelere ve yetişkinlere yöneliktir. 16 yaşından küçük çocuklardan bilerek kişisel veri toplamayız. Bir çocuğun bize verilerini gönderdiğini düşünüyorsanız lütfen bizimle iletişime geçin, verileri sileriz.

## Bu politikadaki değişiklikler

Bu politikayı değiştirdiğimizde sayfanın üstündeki "Son güncelleme" tarihini güncelleriz. Önemli bir değişiklik olursa bunu burada belirtiriz.

## İletişim

Verilerinizle ilgili sorular veya talepler: **[shamflare@hotmail.com](mailto:shamflare@hotmail.com)**
`;

export const privacyPolicy: Record<Locale, string> = { en, ar, tr };
