import { useState, useEffect } from 'react';

const useJsEnabled = () => {
  const [jsEnabled, setJsEnabled] = useState(false);

  useEffect(() => {
    setJsEnabled(true);
  }, []);

  return jsEnabled;
};

export { useJsEnabled };
