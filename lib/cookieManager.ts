import { CookieRecord, HeaderRecord } from '@/types';

class CookieManager {
    private cookies: CookieRecord;
    private baseHeaders: HeaderRecord;

    constructor() {
        this.cookies = {
            "_ga": "GA1.1.566625878.1762887069",
            "_ga_L3RCSWSLG5": "GS2.1.s1764450862$o9$g1$t1764452337$j60$l0$h0",
            "ASP.NET_SessionId": "r1guhnodztkqgguee3lfyksi",
            "cf_clearance": "NoP.zLNneaJfb5wA7ma_LkeCkHtBKfgpkhQqfTmqZhM-1765610935-1.2.1.1-MIsJfDDxf.LITqGhw.fJOxQ9HwxHYWvjp31cayviQfTa1tVbVKJtmG8qFpmv647uGZVubIxxFoBMCXmxOhgn7yj0FAg9JAUBg9rQRB12r2siGK76epI656hycSIUA5CKYq02vi19WH2fZnDQZn5mTFuKyT0KPwMb6ZayqJjvkcMJvMEEnQsyYft1twUpFem6n93RJr2wUnZGU5W_hZFz76GHzyOvuBqXJdTtqf5HMN0",
            "usrtkn": "tkn=r1guhnodztkqgguee3lfyksi",
            "rememberMe": "UserName=J3AUH3EFT3VSK3A3G3LGQ3BFQ3L9L3PCI3I8H37V&Password=J3AUH3L0T42VK4S3G3JB"
        };

        this.baseHeaders = {
            "Host": "www.dijidemi.com",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "DijidemiMobile/41 CFNetwork/3860.300.31 Darwin/25.2.0",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive"
        };
    }

    getCookieString(): string {
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    setCookie(key: string, value: string): void {
        this.cookies[key] = value;
    }

    async getHeaders(): Promise<HeaderRecord> {
        return {
            ...this.baseHeaders,
            "Cookie": this.getCookieString()
        };
    }
}

const cookieManager = new CookieManager();
export default cookieManager;
