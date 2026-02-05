import { NextRequest, NextResponse } from 'next/server';
import { checkSessionServer } from '@/lib/api/serverApi';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    let isAuthenticated = Boolean(accessToken);


    if (!accessToken && refreshToken) {
        try {
            await checkSessionServer();
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

    return NextResponse.next();
}