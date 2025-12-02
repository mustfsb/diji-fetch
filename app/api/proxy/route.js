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
                 "Cookie": "_ga=GA1.1.566625878.1762887069; _ga_L3RCSWSLG5=GS2.1.s1764450862$o9$g1$t1764452337$j60$l0$h0; ASP.NET_SessionId=eh4ao2o3i2g05l15pk0t3smm; cf_clearance=FwWrEil84H_SUaOBYcnV.rB7YScCZQ637lGyS7zPkJ0-1764711795-1.2.1.1-134Jq8aQWtOx0YJken5qj4NYHdA55ELGhzOmtk9fbcvumFygQprGd8ntGz71_F5IAqOhgBg.ZrJKSJg_E3s_RgiveHySAvttQ08cuN1ZRWl9ZDOAZ5C82TU0nPOMEaxmcNM9QLW_TeFCMWXn4y0oFRR7c3TjIhDXLNLCWfLIH.LdovWGyo7XGUNPiokXnkvm1bLSG6viCbYJKx1qU2_dumBhN8lkOoAgSmZ6rFreeh4; usrtkn=tkn=eh4ao2o3i2g05l15pk0t3smm; rememberMe=UserName=T3POT40CP3OLY3VFV4DYB2O0C30GB390M3OME33F&Password=T3POT480P3UGY5NRV4BB",
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
