import createMiddleware from 'next-intl/middleware';
import {locales} from "@/config";

export default createMiddleware({
    // A list of all locales that are supported
    locales: locales,
    localePrefix: "always",
    // Used when no locale matches
    defaultLocale: 'zh'
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(zh|en)/:path*','/((?!_next|_vercel|api|.*\\..*).*)',],
};
