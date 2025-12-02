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
         "Cookie": "_ga=GA1.1.566625878.1762887069; _ga_L3RCSWSLG5=GS2.1.s1764450862$o9$g1$t1764452337$j60$l0$h0; ASP.NET_SessionId=eh4ao2o3i2g05l15pk0t3smm; cf_clearance=FwWrEil84H_SUaOBYcnV.rB7YScCZQ637lGyS7zPkJ0-1764711795-1.2.1.1-134Jq8aQWtOx0YJken5qj4NYHdA55ELGhzOmtk9fbcvumFygQprGd8ntGz71_F5IAqOhgBg.ZrJKSJg_E3s_RgiveHySAvttQ08cuN1ZRWl9ZDOAZ5C82TU0nPOMEaxmcNM9QLW_TeFCMWXn4y0oFRR7c3TjIhDXLNLCWfLIH.LdovWGyo7XGUNPiokXnkvm1bLSG6viCbYJKx1qU2_dumBhN8lkOoAgSmZ6rFreeh4; usrtkn=tkn=eh4ao2o3i2g05l15pk0t3smm; rememberMe=UserName=T3POT40CP3OLY3VFV4DYB2O0C30GB390M3OME33F&Password=T3POT480P3UGY5NRV4BB",
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
