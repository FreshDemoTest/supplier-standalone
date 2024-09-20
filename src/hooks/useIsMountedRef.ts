import { useRef, useEffect } from 'react';

// ----------------------------------------------------------------------

export default function useIsMountedRef() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, [isMounted]);

  return isMounted;
}
