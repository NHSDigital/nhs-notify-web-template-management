import { useState } from 'react';

const useTextAreaInput = (
  initialState: string
): [string, React.ChangeEventHandler<HTMLTextAreaElement>] => {
  const [value, setValue] = useState(initialState);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValue(e.target.value);
  };

  return [value, handleChange];
};

export { useTextAreaInput };
