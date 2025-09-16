import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../design-system/components/Icon';
import { signOut, signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const Header: React.FC = () => {
  const { data: session, status } = useSession()
  const user = (session as any)?.user
  const router = useRouter()
  const role = user?.role
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!(e.target instanceof Node)) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-3" aria-label="Go to home">
            <img src="/icons/FULGO-truck.svg" alt="FULGO" className="w-12 h-auto" />
            <span className="text-xl font-bold text-gray-900">FULGO</span>
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="주문, 상품, 고객 검색..."
              className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" size={16} />
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Integration page add-button removed from header to avoid duplicate controls. */}
          <button aria-label="Notifications" className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative focus:ring-2 focus:ring-primary-500 rounded">
            <Icon name="bell" size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs" aria-hidden="true"></span>
          </button>
          <button aria-label="Settings" className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:ring-2 focus:ring-primary-500 rounded">
            <Icon name="settings" size={20} />
          </button>
          <div className="relative" ref={menuRef}>
            {status === 'loading' ? (
              <div className="w-20 h-6 bg-gray-100 rounded animate-pulse" aria-hidden="true" />
            ) : status === 'unauthenticated' ? (
              // Hide the Sign in button in production when explicitly disabled.
              // In development we show a dev quick-login button if dev creds are provided.
              (process.env.NEXT_PUBLIC_HIDE_LOGIN === '1' && process.env.NODE_ENV === 'production') ? (
                <span className="text-sm text-gray-500">Signed out</span>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Normal Sign in control (visible unless hidden) */}
                  <button onClick={() => signIn(undefined, { callbackUrl: '/' })} className="text-sm text-primary-600 hover:underline">Sign in</button>
                  {/* Dev-only quick login button: enabled when in dev or when NEXT_PUBLIC_ENABLE_DEV_LOGIN=1 */}
                  {((process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === '1') || process.env.NODE_ENV !== 'production') && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const email = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL
                          const password = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD
                          if (!email || !password) {
                            // eslint-disable-next-line no-alert
                            alert('Dev admin credentials not configured. Set NEXT_PUBLIC_DEV_ADMIN_EMAIL and NEXT_PUBLIC_DEV_ADMIN_PASSWORD in .env.local')
                            return
                          }
                          const res: any = await signIn('credentials', { redirect: false, email, password, callbackUrl: '/' })
                          // signIn may return an object with error or ok depending on version
                          if (!res || (res && !res.error)) {
                            window.location.href = '/'
                          } else {
                            // eslint-disable-next-line no-console
                            console.error('Dev sign-in failed', res)
                            // eslint-disable-next-line no-alert
                            alert('Dev sign-in failed. Check console for details.')
                          }
                        } catch (e) {
                          // eslint-disable-next-line no-console
                          console.error('Dev sign-in error', e)
                          // eslint-disable-next-line no-alert
                          alert('Dev sign-in error; see console')
                        }
                      }}
                      className="text-sm px-2 py-1 border rounded bg-gray-100 text-gray-800"
                    >
                      Use Dev Admin
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="relative inline-block text-left">
                <button className="inline-flex items-center space-x-2 focus:outline-none" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(s => !s)}>
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icon name="user" size={16} />
                  </div>
                  <div className="text-sm text-gray-900">{user?.email}</div>
                </button>
                {open && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="py-1" role="none">
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">My Page</a>
                      <button onClick={() => signOut({ callbackUrl: '/settings/integration-admin/login' })} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
