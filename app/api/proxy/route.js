import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const programId = searchParams.get('programId') || '14308';
    const testTur = searchParams.get('testTur') || '1';

    if (!testId) {
        return NextResponse.json({ error: 'Missing testId parameter' }, { status: 400 });
    }

    const baseUrl = 'https://www.dijidemi.com/MobilService/GetTestById';
    const params = new URLSearchParams({
        testId,
        programId,
        testTur,
    });
    const url = `${baseUrl}?${params.toString()}`;

    console.log(`Proxying request to: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                 "Cookie": "rememberMe=UserName=M3FBN3NVD363E31CI3OUH2Z6F34YK3NOX49BW3V6&Password=M3FBN3Y0D3A7E4ECI3MM; usrtkn=tkn=ps1yyokvtmcgw4tf22vgryyq; cf_clearance=_q7lzePFeOQjjy6Y9fJKlZGuqiEWRsiTw9VKaQPWiKs-1764858825-1.2.1.1-oIDtHuHXFcHs9s175TBK3CvZz_z0QxE_x_EzRd89.Xz7yazL958mMimFFYy3AQfQyW0MTVGEqBzdkTrGFxoL1JQdtO2hOOkKQptSjE4aALRBHQHwV2Jc0w_6uYjJEdLqUvhjsJi3viYtRoVcION2zg1G7c4zZW6u9kEV03uqWpEAzugJQJ4frSv38eM8qSsWw6CG.8MJMwbq85fE1VcqrNogakPDB3KcyKF5izgknrs; ASP.NET_SessionId=ps1yyokvtmcgw4tf22vgryyq",
                'User-Agent': 'DijidemiMobile/39 CFNetwork/3860.300.31 Darwin/25.2.0',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Host': 'www.dijidemi.com',
            },
        });

        if (!response.ok) {
            throw new Error(`Upstream API responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
