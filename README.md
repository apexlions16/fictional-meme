# Fictional Meme Studio

Hayalî karakterler ve evrenler üzerinden meme üretmek için hazırlanmış, yüksek kapasiteli ve tamamen tarayıcıda çalışan bir React + TypeScript uygulaması.

## Öne çıkan özellikler

- 12 özgün, procedural görselli şablon
- Fantastik, bilim kurgu, süper kahraman, korku, oyun ve ofis kategorileri
- Kategoriye duyarlı rastgele espri motoru
- Yüksek çözünürlüklü Canvas önizlemesi
- 1:1, 4:5 ve 16:9 çıktı oranları
- Üst ve alt metin katmanları
- Yazı tipi, boyut, kontur, renk, hizalama, konum ve gölge ayarları
- Kullanıcının kendi görselini yükleyebilmesi
- PNG olarak dışa aktarma
- Proje kaydetme, favorileme, silme ve arama
- JSON yedekleme / içe aktarma
- Yerel kullanım istatistikleri
- Koyu ve açık tema
- Mobil uyumlu arayüz
- PWA manifest ve service worker
- Sunucusuz, gizlilik odaklı yerel depolama

## Kurulum

Node.js 24 önerilir.

```bash
npm install
npm run dev
```

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## GitHub Pages

`vite.config.ts` içinde `base: './'` tanımlıdır. Bu nedenle `dist` klasörü statik olarak yayınlanabilir.

```bash
npm run build
```

Ardından GitHub Pages kaynağını GitHub Actions veya `dist` içeriği olacak şekilde yapılandırabilirsin.

## Klavye kısayolları

- `Ctrl/Cmd + S`: aktif projeyi kaydet
- `R`: metin alanında değilken yeni espri üret

## Veri modeli

Projeler ve kullanım istatistikleri `localStorage` üzerinde `fictional-meme:data:v1` anahtarında tutulur. Kütüphane ekranındaki **Yedekle** düğmesiyle JSON dosyası alınabilir.

## Planlanan geliştirmeler

- Sürükle-bırak metin katmanları
- Çoklu metin ve sticker katmanları
- Bulut senkronizasyonu
- Kullanıcı hesapları
- Topluluk şablon pazarı
- Paylaşılabilir proje bağlantıları
- Yapay zekâ destekli metin ve görsel üretimi
- Sunucu tarafı render ve sosyal medya önizlemeleri

## Lisans

MIT

## Releases ve GitHub Packages

`v1.0.0` gibi bir sürüm etiketi GitHub'a gönderildiğinde iki yayın otomatik hazırlanır:

- **Releases** bölümüne çalıştırılabilir statik web arşivleri (`zip` ve `tar.gz`) ile SHA-256 doğrulama dosyası eklenir.
- **Packages** bölümüne `ghcr.io/OWNER/fictional-meme` adıyla `linux/amd64` ve `linux/arm64` container imajı gönderilir.

İlk sürümü yayımlamak için:

```bash
npm ci
npm run release:check
git tag -a v1.0.0 -m "Fictional Meme v1.0.0"
git push origin v1.0.0
```

Container'ı çalıştırma:

```bash
docker pull ghcr.io/KULLANICI_ADIN/fictional-meme:1.0.0
docker run --rm -p 8080:8080 ghcr.io/KULLANICI_ADIN/fictional-meme:1.0.0
```

Yerel Docker geliştirme testi:

```bash
docker compose up --build
```

Sürümleme ayrıntıları için [`RELEASING.md`](RELEASING.md) dosyasına bak.
