# Mercan Şehri (çalışma adı)

6–10 yaş için, tablet ve telefonda tarayıcıdan oynanan deniz kızı oyunu.
Kurulum gerektirmez; "Ana Ekrana Ekle" ile uygulama gibi açılır (PWA).

## Oynanış
- **Gardırop:** saç, saç rengi, kuyruk, kuyruk rengi, üst, makyaj, taç, kolye, göz, ten.
  Kilitli parçalar üç şekilde açılır: **inci** ile satın alma, **görev hediyesi**, **yıldız** sayısına ulaşma.
- **Şehir haritası:** yana kaydırılır. Suya dokununca deniz kızı oraya yüzer, bir dosta dokununca yanına gidip konuşur.
- **5 görev / 5 mini oyun:**
  | Dost | Görev | Mini oyun | İlk hediye |
  |---|---|---|---|
  | Balon Balığı Pofi | Kayıp İnciler | gizli nesne bulma | İnci Taç |
  | Denizatı Dalga | Mercan Feneri | parça sürükleyip yerleştirme | Parıltı makyaj |
  | Kaplumbağa Nine Tosba | Minik Eve Dönüyor | labirent | İki Örgü saç |
  | Ahtapot Postacı Okto | Karışık Mektuplar | resim eşleştirip sürükleme | Yıldızlı üst |
  | Yengeç Usta Kıskaç | Mercan Bahçesi | hafıza kartları | Yelpaze kuyruk |
- Görevler tekrar oynanabilir. Her tekrarda biraz zorlaşır ve yine inci ile yıldız kazandırır.
- Görev bitince şehir değişir: fener yanar, bahçe çiçek açar, Minik evin önünde görünür.
- Konuşmalardaki 🔊 butonu metni Türkçe sesli okur (okuma bilmeyen çocuklar için).
- İlerleme cihazda saklanır (localStorage). Hesap gerekmez.

## Dosyalar
```
index.html            giriş
css/style.css         tüm görünüm (tablet yatay + telefon dikey)
js/data.js            ← parçalar, fiyatlar, kilitler, görev metinleri (içerik buradan düzenlenir)
js/avatar.js          deniz kızı çizimi (katmanlı SVG)
js/scene.js           şehir haritası ve şehir sakinleri
js/games.js           5 mini oyun
js/app.js             ekranlar, gardırop, kayıt, ses
sw.js, manifest       çevrimdışı çalışma + ana ekrana ekleme
```

## Bilgisayarda çalıştırma
```bash
cd ~/Documents/denizkizi-oyunu && python3 -m http.server 8000
```
Sonra tarayıcıda `http://localhost:8000` adresini aç.

## Tablette / telefonda denemek
Aynı Wi-Fi'deyken telefondan `http://<bilgisayarın-IP-adresi>:8000` açılabilir.
Ana ekrana ekleme ve çevrimdışı çalışma için HTTPS gerekir. Bunun için oyunu
GitHub Pages veya Netlify gibi ücretsiz bir yere yüklemek gerekir.
