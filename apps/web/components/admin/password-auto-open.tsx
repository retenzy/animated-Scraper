'use client'

import { useEffect } from 'react'

/**
 * Auto-opens the Payload "Change Password" section on the Users edit page and
 * hides the Change Password / Force Unlock buttons, so the password fields are
 * shown directly.
 */
export const PasswordAutoOpen = () => {
  useEffect(() => {
    const open = () => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /change password/i.test(b.textContent || ''),
      )
      if (btn) {
        btn.click()
      }
    }

    open()
    const t = setTimeout(open, 400)
    return () => clearTimeout(t)
  }, [])

  return null
}
