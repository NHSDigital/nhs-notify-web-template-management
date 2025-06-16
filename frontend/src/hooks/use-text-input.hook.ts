import { useState } from 'react';

type InputValue = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;

export const useTextInput = <T extends InputValue, S = string>(
  initialState: string
): [S, React.ChangeEventHandler<T>] => {
  const [value, setValue] = useState<S>(initialState as S);

  const handleChange: React.ChangeEventHandler<T> = (e) => {
    setValue(e.target.value as S);
  };

  return [value, handleChange];
};
