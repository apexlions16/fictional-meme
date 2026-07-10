# Release ve GitHub Packages süreci

Proje tek bir sürüm etiketiyle iki çıktı üretir:

1. **GitHub Release**: Statik web paketi (`.zip`, `.tar.gz`) ve `SHA256SUMS.txt`.
2. **GitHub Package**: `ghcr.io/OWNER/fictional-meme` adresinde Linux `amd64` ve `arm64` OCI imajı.

## İlk sürüm: v1.0.0

```bash
npm ci
npm run release:check

git add .
git commit -m "ci: add automated releases and GitHub Packages"
git push origin main

git tag -a v1.0.0 -m "Fictional Meme v1.0.0"
git push origin v1.0.0
```

Etiket gönderildiğinde aşağıdaki workflow'lar paralel çalışır:

- `.github/workflows/release.yml`
- `.github/workflows/publish-package.yml`

## Yeni sürüm çıkarma

Patch sürümü:

```bash
npm run release:patch
git push origin main --follow-tags
```

Minor sürümü:

```bash
npm run release:minor
git push origin main --follow-tags
```

Major sürümü:

```bash
npm run release:major
git push origin main --follow-tags
```

`npm version` komutu `package.json` ve `package-lock.json` sürümünü günceller, release commit'i oluşturur ve etiketi ekler.

## Container kullanımı

```bash
docker pull ghcr.io/KULLANICI_ADIN/fictional-meme:1.0.0
docker run --rm -p 8080:8080 ghcr.io/KULLANICI_ADIN/fictional-meme:1.0.0
```

Uygulama `http://localhost:8080` üzerinde açılır. Sağlık kontrolü `http://localhost:8080/healthz` adresindedir.

İlk oluşturulan container paketi varsayılan olarak private görünebilir. Public repo kullanıyorsan paket sayfasındaki **Package settings → Change visibility** alanından public yapabilirsin.
