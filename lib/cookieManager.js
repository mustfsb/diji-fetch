class CookieManager {
    constructor() {
        // Gönderdiğin tüm veriler buraya işlendi
        this.cookies = {
            "ASP.NET_SessionId": "batzjubzlhagupz4gijonb5t",
            "usrtkn": "tkn=5axqo0mewm3wyqmxfcz0cbv3",
            "rememberMe": "UserName=A2VHQ3TLK3GVJ38LP43PP3A3W3V6X4C0U44HA2VH&Password=A2VHQ430K3LFJ4OZP41B"
        };

        // Sabit Başlıklar (Headerlar)
        this.baseHeaders = {
            "Host": "www.dijidemi.com",
            "Sec-Ch-Ua-Platform": "\"macOS\"",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Ch-Ua": "\"Not_A Brand\";v=\"99\", \"Chromium\";v=\"142\"",
            "Sec-Ch-Ua-Mobile": "?0",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
            "Accept": "text/html, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://www.dijidemi.com",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://www.dijidemi.com/Ogrenci",
            "Accept-Encoding": "gzip, deflate, br",
            "Priority": "u=1, i"
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
