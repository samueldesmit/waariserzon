import { useEffect, useState } from 'react';

// 720px matches the desktop CSS's mobile breakpoint and the iOS app's
// one-column layout assumption. Below this, render the iOS-styled
// full-bleed shell instead of the desktop grid.
export const MOBILE_QUERY = '(max-width: 720px)';

export function useIsMobile() {
  const get = () =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
  const [isMobile, setIsMobile] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  return isMobile;
}
