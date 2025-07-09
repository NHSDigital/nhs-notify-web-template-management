import { useState } from 'react';

type InputValue = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;

export const useTextInput = <T extends InputValue, S extends string = string>(
  initialState: S
): [S, React.ChangeEventHandler<T>] => {
  const [value, setValue] = useState<S>(initialState);

  const handleChange: React.ChangeEventHandler<T> = (e) => {
    setValue(e.target.value as S);
  };

  return [value, handleChange];
};
