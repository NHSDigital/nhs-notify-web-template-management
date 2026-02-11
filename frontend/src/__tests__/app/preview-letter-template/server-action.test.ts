/**
 * @jest-environment node
 */
import { submitAuthoringLetterAction } from '@app/preview-letter-template/[templateId]/server-action';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const redirectMock = jest.mocked(redirect);

describe('submitAuthoringLetterAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to submit-letter-template page with valid form data', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '1');

    await submitAuthoringLetterAction({}, formData);

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-letter-template/template-123?lockNumber=1'
    );
  });

  it('should return error state when templateId is missing', async () => {
    const formData = new FormData();
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is missing', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is invalid', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', 'not-a-number');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when templateId is empty', async () => {
    const formData = new FormData();
    formData.append('templateId', '');
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
