class CookieManager {
    constructor() {
        // HTTP İsteğindeki Çerezler Buraya İşlendi
        this.cookies = {
            "ASP.NET_SessionId": "batzjubzlhagupz4gijonb5t",
            // Diğer çerezler (usrtkn, rememberMe) orijinal istekte olmadığı için kaldırıldı veya sabit bırakıldı
            // Eğer ihtiyacınız varsa bunları manuel olarak tekrar ekleyebilirsiniz.
            // Örneğin: "usrtkn": "tkn=5axqo0mewm3wyqmxfcz0cbv3",
        };

        // HTTP İsteğindeki Başlıklar (Headerlar) Buraya İşlendi
        this.baseHeaders = {
            "Host": "www.dijidemi.com",
            "Accept": "application/json, text/plain, */*", // Güncellendi
            // 'Cookie' buraya eklenmiyor, getHeaders metodunda otomatik ekleniyor
            "User-Agent": "DijidemiMobile/41 CFNetwork/3860.300.31 Darwin/25.2.0", // Güncellendi
            "Accept-Language": "en-US,en;q=0.9", // Güncellendi
            "Accept-Encoding": "gzip, deflate, br", // Güncellendi
            "Connection": "keep-alive", // Eklendi
            
            // Orijinal kodunuzda olan ve istekte olmayan diğer sabit başlıklar (isteğe bağlı olarak bırakıldı):
            // "Sec-Ch-Ua-Platform": "\"macOS\"", 
            // "Sec-Ch-Ua": "\"Not_A Brand\";v=\"99\", \"Chromium\";v=\"142\"",
            // "Sec-Ch-Ua-Mobile": "?0",
            // "X-Requested-With": "XMLHttpRequest",
            // "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            // "Origin": "https://www.dijidemi.com",
            // "Sec-Fetch-Site": "same-origin",
            // "Sec-Fetch-Mode": "cors",
            // "Sec-Fetch-Dest": "empty",
            // "Referer": "https://www.dijidemi.com/Ogrenci",
            // "Priority": "u=1, i"
        };
    }

    // Çerezleri string formatına çevirir (hepsini otomatik birleştirir)
    getCookieString() {
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    // İsteğe bağlı: Tek bir çerezi güncellemek istersen
    setCookie(key, value) {
        this.cookies[key] = value;
    }

    // Headerları döndürür
    async getHeaders() {
        return {
            ...this.baseHeaders,
            "Cookie": this.getCookieString()
        };
    }
}

const cookieManager = new CookieManager();
export default cookieManager;
