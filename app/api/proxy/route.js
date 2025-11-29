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
                'Cookie': '_ga=GA1.1.566625878.1762887069; ASP.NET_SessionId=mdkurduboxc3qoun20un0my5; cf_clearance=t8Rw.1IOCWC7noQkzPCXFtwF1hQClrKoDUl9rMCuBV8-1764410923-1.2.1.1-SE87tgzESIGYwWg0K6xbL8tkMdMZBEz_pUI2Ql6Gyd3fRfYTaxBiPjy3YTIoMOZycUg4HUS0KO2xPB9RqXfTcpyNdp4MZiQrf3R7qRBu8S06YVSWTi5CWQSc4gGQ30V8zvSfb98zAkLdGULfidehFDTFzxqjz7KYEvVUnn8CDP7b9m52yaKYSIbd7HtVhQCFmfWekR.8af2b7AP83Do5xhrV0wK8lVrPvIwdMg5zkrs; usrtkn=tkn=mdkurduboxc3qoun20un0my5; rememberMe=UserName=G36EW453V40VC2YFF3JRR3CSJ3AUM3S0S41AI39D&Password=G36EW4D0V464C4A4F3HM; _ga_L3RCSWSLG5=GS2.1.s1764408612$o7$g1$t1764411230$j59$l0$h0',
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
