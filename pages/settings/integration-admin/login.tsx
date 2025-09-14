import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useToast } from 'src/components/ui/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('유효한 이메일을 입력하세요')
    if (!password || password.length < 6) return setError('비밀번호는 최소 6자 이상이어야 합니다')
    setLoading(true)
    try {
      const callback = (router.query.callbackUrl as string) || '/'
      const res = await signIn('credentials', { redirect: false, json: true, email, password, callbackUrl: callback })
      if (!res) {
        setError('No response from auth')
        toast.push('로그인 실패', 'error')
        setLoading(false)
        return
      }
      if ((res as any).ok) {
        toast.push('로그인 성공', 'success')
        const redirectUrl = (res as any).url || callback
        window.location.assign(redirectUrl)
      } else {
        const msg = (res as any).error || 'Invalid credentials'
        setError(msg)
        toast.push('로그인 실패: ' + msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-stretch">
      {/* Left: hero artwork */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 p-8">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.08),transparent)]" aria-hidden="true" />
        <div className="transform -rotate-6 scale-105">
          <img src="/icons/FULGO-truck.svg" alt="FULGO truck" className="w-[520px] max-w-none drop-shadow-2xl" />
        </div>
        <div className="absolute left-8 bottom-8 text-white drop-shadow">
          <h2 className="text-3xl font-extrabold">FULGO</h2>
          <p className="mt-2 text-sm opacity-90">Deliver faster. Manage smarter.</p>
        </div>
      </div>

      {/* Right: login card */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-sm bg-white/60 border border-white/40 rounded-2xl shadow-xl p-8">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center">
                <img src="/icons/FULGO-truck.svg" alt="FULGO" className="w-12 h-auto mr-3" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">FULGO</div>
                  <div className="text-sm text-slate-600">관리자 포털</div>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && <div className="text-red-600 text-center">{error}</div>}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 px-3 py-2 shadow-sm" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 px-3 py-2 shadow-sm" />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="text-primary-600 hover:underline">비밀번호를 잊으셨나요?</a>
                </div>
                <div>
                  <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md shadow">{loading ? '로그인 중...' : '로그인'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
