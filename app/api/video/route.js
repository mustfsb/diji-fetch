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
        "Cookie": "_ga=GA1.1.566625878.1762887069; ASP.NET_SessionId=rubqwcsnxdc33afcucjfohea; cf_clearance=Xy9ZSJFnStF5zeXjtKZ8cio4GOJ29DgVgSe8zDWdm1Q-1764408612-1.2.1.1-vaLFRRWaYK6to87WVFGyuIcsvNPmIiKpLk5CXiNZgbTjOgVLAc2yWrVxcSbboEzfWzGBtd2BV7wWbSKkVzgnhsnyV__5gF3wptifQMm1jnS.ipCC29JyO7iVlBXzZXKVGTWrhDeS1UOijUFwFkhPWJmKXTuQzrtp5pKBQu4PKY5TZOe8pDVBDpT8UJk7zSYQf3YYZxxW8zj2qFmOBza72RvyI4aMfMiOnjpiARNASiY; usrtkn=tkn=rubqwcsnxdc33afcucjfohea; rememberMe=UserName=J3AUH3EFN3LIT3N6U4C8E2T3D31ZL3PCK3LFH37V&Password=J3AUH3L0N3R9T5D6U49M; _ga_L3RCSWSLG5=GS2.1.s1764408612$o7$g1$t1764408646$j26$l0$h0",
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
