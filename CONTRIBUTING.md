# Katkı rehberi

## Geliştirme akışı

1. Repoyu fork et veya yeni bir dal oluştur.
2. `npm ci` ile bağımlılıkları kur.
3. `npm run dev` ile yerel sunucuyu başlat.
4. Değişiklikten önce `npm run typecheck`, ardından `npm run build` çalıştır.
5. Küçük ve açıklayıcı commitler oluştur.

## Commit biçimi

Conventional Commits önerilir:

- `feat: yeni özellik`
- `fix: hata düzeltmesi`
- `refactor: davranışı değiştirmeyen kod düzenlemesi`
- `docs: dokümantasyon`
- `chore: bakım ve yapılandırma`

## Yeni şablon ekleme

`src/data/templates.ts` dosyasındaki `templates` dizisine benzersiz bir `id`, kategori, açıklama, emoji, üç renkli palet, etiketler ve popülerlik puanı ekle.

Kategoriye özel yeni metinler için `src/lib/memeGenerator.ts` içindeki `intros` ve `punchlines` sözlüklerini güncelle.
