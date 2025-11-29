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
                "Cookie": "_ga=GA1.1.566625878.1762887069; ASP.NET_SessionId=wyedmcqju4wjxqyyz3lk2sn0; cf_clearance=F3gxwUqUhtl.TP.lWWmfGHCc2RC2UZ0IjLOLeWtcDEM-1764450862-1.2.1.1-wYlgauCxdQJ7TLKLUyaDCPuhrFKOpnVliNLdZKjqveAb3srrQBMK96gQlpff.OPH_LY0tNhZDnM2EIK9JqmGiqxlhb.nQP7B23CBRQg3ClBFpaD0Qs9wIsXHzxQT9ItB2wqrxTGiCrQA6B_gZhpwHtyMQa1V2vnDv4quKu.v_ujAT3C26hJCEXS0HJ_nAdHiDYqOJJzFZ12eyB4sk8D8ewIARVbnGXh.xYSAUbH2S50; usrtkn=tkn=wyedmcqju4wjxqyyz3lk2sn0; rememberMe=UserName=C30GH3EFE37LE31CC3ENI30IO3IAB390F3DEO3IA&Password=C30GH3L0E3BSE4ECC3CM; _ga_L3RCSWSLG5=GS2.1.s1764450862$o9$g1$t1764450871$j51$l0$h0",
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
