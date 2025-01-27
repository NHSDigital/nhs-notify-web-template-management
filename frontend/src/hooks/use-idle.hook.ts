import { useState, useEffect, useCallback, useRef } from 'react';

function useIdle(idleTimeInSeconds: number) {
  const [idle, setIdle] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleActivity = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(
      () => setIdle(true),
      idleTimeInSeconds * 1000
    );
  }, [idleTimeInSeconds]);

  useEffect(() => {
    const events = ['keypress', 'mousemove', 'scroll', 'click'];

    for (const event of events) {
      window.addEventListener(event, handleActivity);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [handleActivity]);

  return idle;
}

export { useIdle };
