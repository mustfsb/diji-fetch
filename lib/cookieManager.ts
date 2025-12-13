import { CookieRecord, HeaderRecord } from '@/types';

class CookieManager {
    private cookies: CookieRecord;
    private baseHeaders: HeaderRecord;

    constructor() {
        // VERİLEN COOKIE DEĞERLERİ İLE GÜNCELLENMİŞ NESNE
        this.cookies = {
            "_ga": "GA1.1.566625878.1762887069",
            "_ga_L3RCSWSLG5": "GS2.1.s1764450862$o9$g1$t1764452337$j60$l0$h0",
            "kullaniciId": "0", // Yeni eklenen
            "soruCevap": '{"0":{"1120094":{},"1120095":{"0":{"1":"A"}}}}', // Yeni eklenen
            "ASP.NET_SessionId": "vqazx23gbzmqugqtzq3ae03b",
            "cf_clearance": "U.h9Se6OMjcmnmQT1sp3wI1k_QkeGS997PnvMdxCSWU-1765643691-1.2.1.1-EMxknQ4eQRgkSnMLb._gY.OSm1nTJjX2A5aBqZ8v70bubYcsr7XKzcfRNfaNQfZfiTtZeFfG1JHxgVBqvIbLqOUNpEIHcVNJQClvoW42KKL7BXirzPajbYEETRKRweQcln1OnSs4NvTJbZ89eHL6I05HUGFZz2TxKpLqKQVn_GD5CW2CXtHLUV4QN46BOovYHk5uhKb6ew11t4fJDsXH3WMD8zf7w7Q6OWkE9jhg88M",
            "usrtkn": "tkn=vqazx23gbzmqugqtzq3ae03b",
            "rememberMe": "UserName=M3FBD385H3C9G349N40CW3JLM3FBN3TLD3A7F34Y&Password=M3FBD3EBH3GLG4IKN3Y0"
        };
        // Not: Çerez değeri içindeki tırnak işaretleri (\") ve noktalı virgüller (;) genellikle URL kodlaması gerektirir, 
        // ancak bu yapıda doğrudan dize olarak tutulmaları da bir yöntemdir. 
        // "soruCevap" değeri, bir dize olarak tanımlanmıştır.

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
