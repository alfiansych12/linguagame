import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Proteksi rute /admin
    if (pathname.startsWith('/admin')) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // Jika tidak login atau bukan admin
        if (!token || !token.isAdmin) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            // Kasih query param buat trigger alert ejekan
            url.searchParams.set('intruder', 'true');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
