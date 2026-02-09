import { formDataToFormStateFields } from '@utils/form-data-to-form-state';

it('returns an object with all of the form data values', () => {
  const form = new FormData();
  form.append('foo', 'a');
  form.append('bar', 'b');
  form.append('baz', 'c');

  expect(formDataToFormStateFields(form)).toEqual({
    foo: 'a',
    bar: 'b',
    baz: 'c',
  });
});

it('removes File objects', () => {
  const form = new FormData();
  form.append('foo', 'a');
  form.append('bar', new File(['hello'], 'file.txt'));

  expect(formDataToFormStateFields(form)).toEqual({
    foo: 'a',
  });
});
