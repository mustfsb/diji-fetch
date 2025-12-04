class CookieManager {
    constructor() {
        // User can manually update these cookies here
        this.cookies = {
            "usrtkn": "tkn=2dffhty3nz3cuckqvyqyvrtl",
            "rememberMe": "UserName=X3YMB350H3C9B2V0W4FLL34LO3IAU473V464U3S7&Password=X3YMB3B0H3GLB480W4D0"
        };
    }

    getCookieString() {
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    // Kept async to maintain compatibility with existing calls
    async getHeaders() {
        return {
            "Host": "www.dijidemi.com",
            "Cookie": this.getCookieString(),
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
