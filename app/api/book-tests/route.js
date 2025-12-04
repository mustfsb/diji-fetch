import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
        }

        // Hardcoded headers and cookies as per user request
        const headers = {
            "Cookie": "rememberMe=UserName=M3FBN3NVD363E31CI3OUH2Z6F34YK3NOX49BW3V6&Password=M3FBN3Y0D3A7E4ECI3MM; usrtkn=tkn=ps1yyokvtmcgw4tf22vgryyq; cf_clearance=_q7lzePFeOQjjy6Y9fJKlZGuqiEWRsiTw9VKaQPWiKs-1764858825-1.2.1.1-oIDtHuHXFcHs9s175TBK3CvZz_z0QxE_x_EzRd89.Xz7yazL958mMimFFYy3AQfQyW0MTVGEqBzdkTrGFxoL1JQdtO2hOOkKQptSjE4aALRBHQHwV2Jc0w_6uYjJEdLqUvhjsJi3viYtRoVcION2zg1G7c4zZW6u9kEV03uqWpEAzugJQJ4frSv38eM8qSsWw6CG.8MJMwbq85fE1VcqrNogakPDB3KcyKF5izgknrs; ASP.NET_SessionId=ps1yyokvtmcgw4tf22vgryyq",
            "Content-Length": "0",
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

        const url = `https://www.dijidemi.com/Ogrenci/KitapTestlerTable?Id=${id}&___layout`;

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: ''
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Upstream error: ${response.status}` }, { status: response.status });
        }

        const html = await response.text();

        // Improved parsing logic to capture ALL tests
        // We look for the pattern: <h3>Title</h3> ... data-rowid="ID"
        // The previous split method might have been too aggressive or missed nested structures.
        // Using a global regex with matchAll is safer.

        const tests = [];
        // Regex explanation:
        // <h3>(.*?)<\/h3>  -> Captures the title inside h3
        // [\s\S]*?         -> Matches any character (including newlines) non-greedily until...
        // data-rowid="(\d+)" -> Captures the numeric ID
        const regex = /<h3>(.*?)<\/h3>[\s\S]*?data-rowid="(\d+)"/g;

        const matches = [...html.matchAll(regex)];

        for (const match of matches) {
            let title = match[1].trim();
            const id = match[2];

            // Decode HTML entities
            title = title.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

            tests.push({
                name: title,
                id: id
            });
        }

        return NextResponse.json({ success: true, tests });

    } catch (error) {
        console.error('Error fetching tests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

