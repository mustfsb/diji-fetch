import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Assignment, AssignmentsResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<AssignmentsResponse | { error: string }>> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ASP.NET_SessionId');
        const userToken = cookieStore.get('usrtkn');
        const rememberMe = cookieStore.get('rememberMe');

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Uygulamaya giriş yapmanız gerekmektedir.' }, { status: 401 });
        }

        const cookieString = [
            `ASP.NET_SessionId=${sessionCookie.value}`,
            userToken ? `usrtkn=${userToken.value}` : '',
            rememberMe ? `rememberMe=${rememberMe.value}` : '',
            'kullaniciId=0',
            'soruCevap={"0":{}}'
        ].filter(Boolean).join('; ');

        const url = 'https://www.dijidemi.com/Ogrenci/_OdevDurum?___layout';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Cookie': cookieString,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'Accept': 'text/html, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Origin': 'https://www.dijidemi.com',
                'Referer': 'https://www.dijidemi.com/Ogrenci',
            },
            body: ''
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Sunucudan veri alınamadı (${response.status})` }, { status: response.status });
        }

        const html = await response.text();

        // Helper to decode HTML entities (e.g. &#214; -> Ö)
        const decodeEntities = (str: string): string => {
            return str.replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(parseInt(dec, 10)));
        };

        const assignments: Assignment[] = [];
        const regex = /<p class="font-small-1 m-0">([^<]+)<\/p>\s*<span>\s*([^<]+)\s*<\/span>[\s\S]*?data-rowid="(\d+)"/g;

        let match: RegExpExecArray | null;
        while ((match = regex.exec(html)) !== null) {
            const rawTitle = match[1].trim();
            const date = match[2].trim();

            // Clean title: Decode entities, remove extra whitespace
            const cleanTitle = decodeEntities(rawTitle).replace(/\s+/g, ' ');

            assignments.push({
                title: cleanTitle,
                dateRange: date,
                id: match[3],
                link: `https://www.dijidemi.com/Ogrenci/Odev?id=${match[3]}`
            });
        }

        return NextResponse.json({ assignments });

    } catch (error) {
        console.error('Assignments API Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
