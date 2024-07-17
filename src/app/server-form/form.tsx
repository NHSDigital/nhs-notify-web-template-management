'use client';

import { Button, Form, TextInput } from 'nhsuk-react-components';
import React from 'react';
import { useFormState } from 'react-dom';

export function FormControls({ value }: { value: string }) {
  return (
    <TextInput label='Action' id='action' name='action' defaultValue={value} />
  );
}

export function TestForm({
  state,
  action,
}: {
  state: { action: string };
  action: (
    initialState: { action: string },
    payload: FormData
  ) => Promise<{ action: string }>;
}) {
  const [currentState, handleForm] = useFormState(action, state);

  return (
    <Form action={handleForm}>
      <TextInput
        label='Action'
        id='action'
        name='action'
        defaultValue={currentState.action}
      />

      {JSON.stringify(currentState)}
      <Button>Submit</Button>
    </Form>
  );
}
