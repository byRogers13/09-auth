import { NextRequest, NextResponse } from 'next/server';
import { checkSessionServer } from '@/lib/api/serverApi';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    let isAuthenticated = Boolean(accessToken);

    const response = NextResponse.next();

    if (!accessToken && refreshToken) {
        try {
            const refreshResponse = await checkSessionServer();

            if (refreshResponse.status !== 200) {
                throw new Error('Refresh failed');
            }

            const setCookie = refreshResponse.headers['set-cookie'];

            if (setCookie) {
                response.headers.set(
                    'set-cookie',
                    Array.isArray(setCookie) ? setCookie.join(',') : setCookie
                );
            }

            isAuthenticated = true;
        } catch {
            isAuthenticated = false;
        }
    }

    if (
        !isAuthenticated &&
        PRIVATE_ROUTES.some(route => pathname.startsWith(route))
    ) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (
        isAuthenticated &&
        AUTH_ROUTES.some(route => pathname.startsWith(route))
    ) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}