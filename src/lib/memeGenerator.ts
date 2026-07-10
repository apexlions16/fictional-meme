import type { Category } from '../types/models';

const intros: Record<Category, string[]> = {
  fantastik: [
    'Büyücülük okuluna kabul edildim',
    'Ejderha konseyi toplandı',
    'Kadim parşömeni sonunda açtım',
    'Karanlık ormanda yan görev aldım',
  ],
  'bilim-kurgu': [
    'Zaman makinesini çalıştırdım',
    'Uzaylılar dünyaya indi',
    'Yapay zekâ bilinç kazandı',
    'Mars kolonisine ilk günüm',
  ],
  'süper-kahraman': [
    'Şehri üçüncü kez kurtardım',
    'Gizli kimliğim ortaya çıktı',
    'Karanlık lord final konuşmasına başladı',
    'Yeni süper gücümü keşfettim',
  ],
  korku: [
    'Gece bodrumdan ses geldi',
    'Aynadaki yansımam göz kırptı',
    'Hayalet sonunda mesaj attı',
    'Vampir sabah toplantısına katıldı',
  ],
  oyun: [
    'Final boss ikinci forma geçti',
    'NPC bana yine aynı görevi verdi',
    'Bütün iksirleri finale sakladım',
    'Takım arkadaşım gizli kapıyı buldu',
  ],
  ofis: [
    'Toplantı aslında e-posta olabilirdi',
    'Yazıcı teslimden önce bozuldu',
    'Takvimde boş saat buldum',
    'Sunumun son slaydına geldim',
  ],
};

const punchlines: Record<Category, string[]> = {
  fantastik: [
    'ilk ders yine Excel çıktı',
    'ama bütçe için onay bekliyoruz',
    'meğer kullanım şartlarıymış',
    'ödül olarak deneyim yerine toplantı geldi',
  ],
  'bilim-kurgu': [
    'sadece pazartesi sabahına gidiyor',
    'ilk sordukları şey Wi-Fi şifresi oldu',
    've bütün bildirimleri kapattı',
    'uzaktan çalışma seçeneği yokmuş',
  ],
  'süper-kahraman': [
    'ama masraf formu hâlâ bekliyor',
    'annem zaten herkese söylemiş',
    'ben altyazıları okuyup bekliyorum',
    'Ctrl+Z olduğunu fark ettim',
  ],
  korku: [
    'meğer robot süpürgeymiş ama robot süpürgem yok',
    'ben de görmezden geldim',
    'sadece “görüldü” yazıyordu',
    'kamerasını açması daha korkunçtu',
  ],
  oyun: [
    'ben hâlâ öğretici bölümdeyim',
    'bu kez diyalog seçeneğim “hayır”',
    'oyunu bitirince hiçbirini kullanmadım',
    'ama herkes ganimeti paylaşmadan çıktı',
  ],
  ofis: [
    'o yüzden iki saat toplantı yaptık',
    'yazıcı bunu kişisel algılıyor',
    'biri hemen yeni toplantı ekledi',
    '“başka sorusu olan?” dendi',
  ],
};

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const generateCopy = (category: Category): { top: string; bottom: string } => ({
  top: pick(intros[category]),
  bottom: pick(punchlines[category]),
});
