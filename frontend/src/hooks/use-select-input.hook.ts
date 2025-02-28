import { useState } from 'react';

type InputValue = HTMLOptionElement;

export const useSelectInput = <T extends InputValue>(
  initialState: string
): [string, React.ChangeEventHandler<T>] => {
  const [value, setValue] = useState(initialState);

  const handleChange: React.ChangeEventHandler<T> = (e) => {
    setValue(e.target.value);
  };

  return [value, handleChange];
};
