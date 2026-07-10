# `fictional-meme` reposuna yükleme

Bu klasörün içeriğini GitHub'da oluşturduğun boş `fictional-meme` reposunun yerel klasörüne kopyala.

```bash
git clone https://github.com/KULLANICI_ADIN/fictional-meme.git
cd fictional-meme
# Bu paketteki dosyaları bu klasöre kopyala.
npm install
npm run build
git add .
git commit -m "feat: launch fictional meme studio"
git push origin main
```

## GitHub Pages'i açma

1. GitHub'da repo içindeki **Settings** sekmesini aç.
2. Sol menüden **Pages** bölümüne gir.
3. **Build and deployment / Source** alanında **GitHub Actions** seç.
4. `main` dalına yapılan push sonrasında `Deploy Fictional Meme to GitHub Pages` iş akışı uygulamayı otomatik yayınlar.

## Önerilen sonraki commitler

```text
feat: add draggable canvas layers
feat: add sticker and shape library
feat: add cloud project synchronization
feat: add community template marketplace
feat: add ai-assisted fictional copy generation
```

## Releases ve Packages'i etkinleştirme

Ek bir secret oluşturman gerekmez. Workflow'lar GitHub'ın otomatik `GITHUB_TOKEN` yetkisini kullanır.

Kodları `main` dalına gönderdikten sonra ilk sürüm etiketini oluştur:

```bash
git tag -a v1.0.0 -m "Fictional Meme v1.0.0"
git push origin v1.0.0
```

GitHub'da **Actions** sekmesinde şu iki iş akışı çalışır:

- `Create GitHub Release`
- `Publish GitHub Package`

Başarılı tamamlandığında repo ana sayfasında **Releases** ve **Packages** bağlantıları görünür. Container paketi ilk yayında private olabilir; paket ayarlarından görünürlüğünü public olarak değiştirebilirsin.
