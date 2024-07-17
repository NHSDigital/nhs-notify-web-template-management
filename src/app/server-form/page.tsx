/* eslint-disable no-console */
import { getState } from '@/src/utils/form-actions';
import { cookies } from 'next/headers';
import { TestForm } from './form';
import { handleForm } from './actions';

export default async function ServerForm({
  searchParams,
}: {
  searchParams: { sessionId: string };
}) {
  const cook = cookies().getAll();
  const state = (await getState(searchParams.sessionId)) ?? {
    id: 'unknown',
    action: 'unknown',
  };
  console.log(cook);
  console.log(state);
  console.log(searchParams);

  return <TestForm action={handleForm} state={{ action: state.id }} />;
}
