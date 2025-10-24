import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LANGUAGES = ['ko', 'en', 'vi']
const DEFAULT_LANGUAGE = 'ko'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 정적 파일이나 API 요청은 건너뛰기
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 이미 언어 코드가 있으면 통과
  const pathnameHasLocale = SUPPORTED_LANGUAGES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // 언어 코드가 없으면 쿠키 또는 기본값으로 설정
  const locale = SUPPORTED_LANGUAGES.includes(
    request.cookies.get('NEXT_LOCALE')?.value || ''
  )
    ? request.cookies.get('NEXT_LOCALE')!.value
    : DEFAULT_LANGUAGE

  // URL 리다이렉트
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  )
}

export const config = {
  matcher: [
    '/((?!_next|api|.*\\.).*)',
  ],
}
