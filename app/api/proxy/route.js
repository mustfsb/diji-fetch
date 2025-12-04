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
                 "Cookie": "usrtkn=tkn=2dffhty3nz3cuckqvyqyvrtl; rememberMe=UserName=X3YMB350H3C9B2V0W4FLL34LO3IAU473V464U3S7&Password=X3YMB3B0H3GLB480W4D0",
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
