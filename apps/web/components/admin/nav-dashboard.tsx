import Link from 'next/link'

/**
 * Adds a "Dashboard" link to the top of the admin sidebar.
 */
export const NavDashboardLink = () => {
  return (
    <div className="rz-nav-dashboard">
      <Link href="/admin" className="rz-nav-dashboard-link">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
        Dashboard
      </Link>
    </div>
  )
}
