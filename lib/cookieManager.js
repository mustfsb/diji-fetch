class CookieManager {
    constructor() {
        // User can manually update these cookies here
        this.cookies = {
            "usrtkn": "tkn=zfvqjcufsikd4x2zgfwhflc1",
            "rememberMe": "UserName=H37VR3V7K3GVT3N6M3YML34LM3FBX4C0M3OMK3CC&Password=H37VR44MK3LFT5D6M3UB"
        };
    }

    getCookieString() {
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; '); // Çerezleri ayırmak için '; ' kullanır
    }

    // Kept async to maintain compatibility with existing calls
    async getHeaders() {
        return {
            "Host": "www.dijidemi.com",
            "Cookie": this.getCookieString(), // Bu, yukarıdaki güncellenmiş çerez dizesini döndürecektir
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
}

// Export as singleton
const cookieManager = new CookieManager();
export default cookieManager;
