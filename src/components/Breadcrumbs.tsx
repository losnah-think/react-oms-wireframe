import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

function toTitle(segment: string) {
  // convert kebab/camel to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Breadcrumbs() {
  const router = useRouter()
  const asPath = router.asPath || ''

  // remove query string and hash
  const path = asPath.split('?')[0].split('#')[0]

  // avoid empty segment for root path to prevent duplicate '/' entries
  const segments = path === '/' ? [] : path.split('/').filter(Boolean)

  const items = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/')
    const name = seg.startsWith('[') ? seg.replace(/\[|\]|\.\.\./g, ':param') : toTitle(seg)
    return { href, name }
  })

  // include home
  const crumbs = [{ href: '/', name: 'Home' }, ...items]

  return (
    <nav aria-label="Breadcrumb" style={{ padding: '6px 12px', fontSize: 13 }}>
      {crumbs.map((c, i) => (
        <span key={`${c.href}-${i}`}>
          {i > 0 && <span style={{ margin: '0 6px' }}>{'>'}</span>}
          {i < crumbs.length - 1 ? (
            <Link href={c.href} style={{ color: '#0366d6', textDecoration: 'none' }}>
              {c.name}
            </Link>
          ) : (
            <span style={{ color: '#333' }} aria-current="page">
              {c.name}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
