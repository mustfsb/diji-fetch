import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const soruId = searchParams.get('soruId');

    if (!testId || !soruId) {
        return NextResponse.json({ error: 'Missing testId or soruId' }, { status: 400 });
    }

    // Headers from user request
    const headers = {
        "Host": "www.dijidemi.com",
         "Cookie": "usrtkn=tkn=2dffhty3nz3cuckqvyqyvrtl; rememberMe=UserName=X3YMB350H3C9B2V0W4FLL34LO3IAU473V464U3S7&Password=X3YMB3B0H3GLB480W4D0",
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

    const url = `https://www.dijidemi.com/Ogrenci2020/Video?___layout`;

    // Body from user request: tur=2&sinavId=0&sinavTuru=2&testId=1120092&soruId=1
    const body = `tur=2&sinavId=0&sinavTuru=2&testId=${testId}&soruId=${soruId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Upstream error: ${response.status}` }, { status: response.status });
        }

        const html = await response.text();

        // Extract video URL
        const videoMatch = html.match(/<video src="([^"]+)"/);

        if (videoMatch && videoMatch[1]) {
            return NextResponse.json({
                success: true,
                videoUrl: videoMatch[1],
                testId,
                soruId
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Video not found',
                htmlSnippet: html.substring(0, 500)
            });
        }

    } catch (error) {
        console.error('Video Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
