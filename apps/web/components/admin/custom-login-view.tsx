'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const CustomLoginView = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    let cancelled = false
    fetch('/cms-api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.user) window.location.href = '/admin'
        else if (!cancelled) setChecking(false)
      })
      .catch(() => !cancelled && setChecking(false))
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/cms-api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (res.ok) {
        window.location.href = '/admin'
        return
      }
      let message = 'Login failed. Please try again.'
      try {
        const data = await res.json()
        const first = data?.errors?.[0]?.message
        if (first) message = first
      } catch {}
      setError(message)
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rz-login">
      <style>{css}</style>

      {/* Brand panel */}
      <aside className="rz-login-brand">
        <div className="rz-login-brand-inner">
          <h1 className="rz-login-tagline">
            Extract Amazon reviews
            <br />
            <em>in seconds.</em>
          </h1>
          <p className="rz-login-sub">
            High-speed local scraping powered by a Chrome extension. Secure credentials,
            credit-based billing and instant CSV exports.
          </p>
          <ul className="rz-login-points">
            <li>Fast local review extraction</li>
            <li>Instant CSV export</li>
            <li>Credit-based billing</li>
          </ul>
        </div>
        <div className="rz-login-foot">© {new Date().getFullYear()} Retenzy</div>
      </aside>

      {/* Form panel */}
      <main className="rz-login-panel">
        {checking ? (
          <div className="rz-login-hint">Checking session…</div>
        ) : (
          <form className="rz-login-card" onSubmit={submit}>
            <h2 className="rz-login-title">Welcome back</h2>
            <p className="rz-login-cardsub">Sign in to your admin account to continue.</p>

            {error && (
              <div className="rz-login-error" role="alert">
                {error}
              </div>
            )}

            <label className="rz-login-label" htmlFor="rz-email">
              Email address
            </label>
            <input
              id="rz-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rz-login-input"
            />

            <label className="rz-login-label" htmlFor="rz-password">
              Password
            </label>
            <div className="rz-login-pw">
              <input
                id="rz-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="rz-login-input"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="rz-login-eye"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="rz-login-btn">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="rz-login-note">Protected area · authorized team members only</p>
          </form>
        )}
      </main>
    </div>
  )
}

const css = `
.rz-login{position:fixed;inset:0;z-index:9999;display:flex;width:100vw;height:100vh;overflow:auto;
  background:#ffffff;color:#1f2937;
  font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}

/* ---- Brand panel ---- */
.rz-login-brand{flex:1.25 1 0%;min-width:0;display:none;align-items:center;justify-content:center;
  padding:72px 64px;position:relative;overflow:hidden;flex-direction:column;
  background:
    radial-gradient(1100px 620px at -5% -5%, rgba(59,130,246,.14), transparent 62%),
    radial-gradient(950px 560px at 108% 108%, rgba(249,115,22,.13), transparent 60%),
    linear-gradient(160deg,#fbfdff 0%,#f0f6ff 55%,#fff7ef 100%);}
@media(min-width:1024px){.rz-login-brand{display:flex}}
.rz-login-brand-inner{max-width:520px;width:100%;text-align:center}
.rz-login-logo{width:60px;height:60px;border-radius:18px;display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:28px;color:#fff;margin:0 auto 44px;
  background:linear-gradient(135deg,#2563eb,#f97316);box-shadow:0 12px 32px rgba(37,99,235,.30)}
.rz-login-tagline{font-size:min(56px,4.2vw);line-height:1.12;font-weight:800;color:#111827;
  letter-spacing:-.03em;margin:0 0 24px;text-wrap:balance}
.rz-login-tagline em{font-style:normal;
  background:linear-gradient(90deg,#2563eb,#f97316);-webkit-background-clip:text;background-clip:text;color:transparent}
.rz-login-sub{color:#6b7280;font-size:17px;line-height:1.75;margin:0 auto 40px;max-width:420px}
.rz-login-points{list-style:none;padding:0;margin:0 auto;display:inline-flex;flex-direction:column;gap:16px;text-align:left}
.rz-login-points li{position:relative;padding-left:38px;color:#374151;font-size:16px}
.rz-login-points li::before{content:"✓";position:absolute;left:0;top:0;width:26px;height:26px;border-radius:50%;
  background:#dbeafe;color:#2563eb;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
.rz-login-foot{margin-top:56px;color:#9ca3af;font-size:13px;text-align:center}

/* ---- Form panel ---- */
.rz-login-panel{flex:1 1 0%;min-width:0;display:flex;align-items:center;justify-content:center;padding:48px clamp(24px,6vw,96px);background:#fff}
.rz-login-card{width:100%;max-width:480px}
.rz-login-logo-sm{width:52px;height:52px;border-radius:15px;font-size:24px;margin-bottom:28px;
  box-shadow:0 8px 22px rgba(37,99,235,.28)}
.rz-login-title{margin:0 0 8px;font-size:34px;font-weight:800;color:#111827;letter-spacing:-.025em}
.rz-login-cardsub{margin:0 0 40px;color:#6b7280;font-size:16px;line-height:1.6}
.rz-login-error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;
  border-radius:12px;padding:14px 16px;font-size:14px;margin-bottom:22px}
.rz-login-label{display:block;font-size:13.5px;font-weight:600;color:#374151;margin:24px 0 10px}
.rz-login-input{width:100%;box-sizing:border-box;background:#fff;border:1.5px solid #d1d5db;color:#111827;
  border-radius:14px;padding:15px 18px;font-size:16px;outline:none;transition:border-color .15s,box-shadow .15s}
.rz-login-input::placeholder{color:#9ca3af}
.rz-login-input:focus{border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.13)}
.rz-login-pw{position:relative}
.rz-login-pw .rz-login-input{padding-right:48px}
.rz-login-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);
  display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;
  border:none;background:transparent;color:#94a3b8;cursor:pointer;border-radius:8px;
  transition:color .15s,background .15s}
.rz-login-eye:hover{color:#2563eb;background:#f1f5f9}
.rz-login-btn{width:100%;margin-top:40px;border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:700;
  color:#fff;cursor:pointer;background:#3b82f6;
  box-shadow:0 10px 24px rgba(59,130,246,.30);transition:filter .15s,transform .05s,background .15s}
.rz-login-btn:hover{background:#2f74e8}
.rz-login-btn:hover{filter:brightness(1.07)}
.rz-login-btn:active{transform:translateY(1px)}
.rz-login-btn:disabled{opacity:.55;cursor:not-allowed}
.rz-login-note{text-align:center;color:#9ca3af;font-size:13px;margin:30px 0 0}
.rz-login-hint{color:#6b7280;font-size:15px}

/* Mobile: hide brand, keep centered form */
@media(max-width:1023px){
  .rz-login-panel{background:
    radial-gradient(700px 400px at 90% -10%, rgba(59,130,246,.08), transparent 60%),
    radial-gradient(600px 380px at -10% 110%, rgba(249,115,22,.07), transparent 60%),#fff;}
}
`
