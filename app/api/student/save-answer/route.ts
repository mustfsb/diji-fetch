import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { SaveAnswerRequest, UserAnswers } from '@/types';

interface SaveAnswerResponse {
    success?: boolean;
    raw?: string;
    error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SaveAnswerResponse>> {
    try {
        const body: SaveAnswerRequest = await request.json();
        const { testId, answers, totalQuestions, dersId = 0, odevId = 0, turId = 2 } = body;

        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ASP.NET_SessionId');
        const userToken = cookieStore.get('usrtkn');
        const rememberMe = cookieStore.get('rememberMe');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // 1. Construct Answer String
        let answersString = "";
        const limit = totalQuestions || 40;
        for (let i = 1; i <= limit; i++) {
            answersString += (answers[i] || " ");
        }

        // 2. Construct soruCevap Cookie JSON
        // Format: {"0":{"<testId>":{"0":{"1":"A"}}}}
        const cookieAnswers: { [key: string]: string } = {};
        Object.keys(answers).forEach(k => {
            cookieAnswers[k] = answers[parseInt(k, 10)];
        });

        const soruCevapObj = {
            "0": {
                [testId]: {
                    "0": cookieAnswers
                }
            }
        };
        const soruCevapJson = JSON.stringify(soruCevapObj);

        // 3. Construct URL Params
        const params = new URLSearchParams({
            dersId: String(dersId) || '969',
            odevId: String(odevId),
            testId,
            turId: String(turId),
            cevaplar: answersString,
            _: Date.now().toString()
        });

        const url = `https://www.dijidemi.com/Ogrenci2020/TestCevapKaydetV2?${params.toString()}`;

        // 4. Construct Cookie Header
        const cookieBase = [
            `_ga=GA1.1.566625878.1762887069`,
            `kullaniciId=0`,
            `ASP.NET_SessionId=${sessionCookie.value}`,
            userToken ? `usrtkn=${userToken.value}` : '',
            rememberMe ? `rememberMe=${rememberMe.value}` : '',
            `soruCevap=${soruCevapJson}`
        ].filter(Boolean).join('; ');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cookie': cookieBase,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://www.dijidemi.com/Ogrenci',
                'Content-Type': 'application/json; charset=UTF-8'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to save answers' }, { status: response.status });
        }

        const text = await response.text();
        return NextResponse.json({ success: true, raw: text });

    } catch (error) {
        console.error('Save Answer Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
