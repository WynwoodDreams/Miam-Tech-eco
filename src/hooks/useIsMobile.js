import { useEffect, useState } from 'react'

const QUERY = '(max-width: 760px)'

/**
 * Tracks whether the viewport is phone-sized, via matchMedia so it updates
 * on resize/orientation-change without a scroll-driven listener. 760px
 * covers portrait phones and small landscape phones; tablets get the
 * desktop floating-panel layout.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
