// middleware.ts
import { createI18nMiddleware } from 'next-international/middleware'
import { NextRequest, NextResponse } from 'next/server'

const FRENCH_SPEAKING_COUNTRIES = [
  'FR', 'BE', 'CH', 'CA', 'LU', 'MC', 'RE', 'GP', 'MQ', 'GF', 'YT', 'NC', 'PF', 
  'PM', 'WF', 'BL', 'MF', 'SN', 'CI', 'ML', 'NE', 'BF', 'CD', 'CG', 'CM', 'MG', 
  'GA', 'TG', 'BJ', 'RW', 'BI', 'TN', 'MA', 'DZ', 'HT'
];
 
const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en'
})

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Permettre de désactiver la redirection avec ?no-redirect=1
  const url = new URL(request.url);
  const noRedirect = url.searchParams.get('no-redirect') === '1';
  if (noRedirect) {
    url.searchParams.delete('no-redirect');
    const response = I18nMiddleware(request);
    response.cookies.set('skip-geo-redirect', '1', { maxAge: 60 * 60 * 24 * 30 });
    return response;
  }

  // Vérifier si l'utilisateur a désactivé la redirection
  const skipRedirect = request.cookies.get('skip-geo-redirect')?.value === '1';
  if (skipRedirect) {
    return I18nMiddleware(request);
  }

  // Obtenir le pays et le domaine
  const country = (request as any).geo?.country || request.headers.get('x-vercel-ip-country') || '';
  const hostname = request.headers.get('host') || '';
  const isFrDomain = hostname.includes('.fr');
  const isComDomain = hostname.includes('.com');

  // Déterminer si c'est un pays francophone
  const isFrenchSpeaking = FRENCH_SPEAKING_COUNTRIES.includes(country);

  // Redirection .com → .fr pour francophones
  if (isComDomain && isFrenchSpeaking) {
    const newUrl = new URL(request.url);
    newUrl.hostname = hostname.replace('.com', '.fr');
    
    const currentLocale = pathname.match(/^\/(en|fr)(\/|$)/)?.[1];
    if (currentLocale) {
      newUrl.pathname = pathname.replace(`/${currentLocale}`, `/fr`);
    } else {
      newUrl.pathname = `/fr${pathname}`;
    }
    
    return NextResponse.redirect(newUrl, { status: 307 });
  }

  // Redirection .fr → .com pour non-francophones
  if (isFrDomain && !isFrenchSpeaking) {
    const newUrl = new URL(request.url);
    newUrl.hostname = hostname.replace('.fr', '.com');
    
    const currentLocale = pathname.match(/^\/(en|fr)(\/|$)/)?.[1];
    if (currentLocale) {
      newUrl.pathname = pathname.replace(`/${currentLocale}`, `/en`);
    } else {
      newUrl.pathname = `/en${pathname}`;
    }
    
    return NextResponse.redirect(newUrl, { status: 307 });
  }

  return I18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)']
}