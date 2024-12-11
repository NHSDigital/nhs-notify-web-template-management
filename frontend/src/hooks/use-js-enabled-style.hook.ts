import { useState, useEffect, CSSProperties } from 'react';

const useJsEnabledStyle = () => {
  const [jsEnabledStyle, setJsEnabledStyle] = useState<
    CSSProperties | undefined
  >({ display: 'none' });

  useEffect(() => {
    setJsEnabledStyle(undefined);
  }, []);

  return jsEnabledStyle;
};

export { useJsEnabledStyle };
