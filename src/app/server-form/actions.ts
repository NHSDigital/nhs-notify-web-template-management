'use server';

export async function handleForm(
  currentState: { action: string },
  formData: FormData
) {
  const action = formData.get('action') as string;
  const valid = action === 'error';

  // save data if valid and redirect to new page...

  // else return invalid if form is invalid.

  console.log(action);

  return { action, valid };
}
