import { renderHook, act } from '@testing-library/react';
import { useTemplatePoll } from '@hooks/use-template-poll';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

const TEMPLATE_ID = 'template-abc';

const pendingTemplate: AuthoringLetterTemplate = {
  id: TEMPLATE_ID,
  name: 'Test Letter',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  letterType: 'x0',
  language: 'en',
  letterVersion: 'AUTHORING',
  files: {
    docxTemplate: {
      currentVersion: 'v1',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    },
  },
  systemPersonalisation: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  lockNumber: 1,
};

jest.mock('@utils/get-base-path', () => ({
  getBasePath: () => '/my-base',
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(pendingTemplate), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useTemplatePoll', () => {
  it('fetches from the correct URL using getBasePath and the template id', async () => {
    renderHook(() =>
      useTemplatePoll({
        initialTemplate: pendingTemplate,
        shouldPoll: () => true,
        onUpdate: jest.fn(),
      })
    );

    await act(() => Promise.resolve());

    expect(fetch).toHaveBeenCalledWith(
      `/my-base/preview-letter-template/${TEMPLATE_ID}/poll`,
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('passes an AbortSignal to fetch', async () => {
    renderHook(() =>
      useTemplatePoll({
        initialTemplate: pendingTemplate,
        shouldPoll: () => true,
        onUpdate: jest.fn(),
      })
    );

    await act(() => Promise.resolve());

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('calls onUpdate with parsed JSON when shouldPoll returns false', async () => {
    const updatedTemplate: AuthoringLetterTemplate = {
      ...pendingTemplate,
      files: {
        ...pendingTemplate.files,
        initialRender: {
          fileName: 'render.pdf',
          currentVersion: 'v1',
          status: 'RENDERED',
          pageCount: 1,
        },
      },
    };

    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(updatedTemplate), { status: 200 })
      );

    const onUpdate = jest.fn();

    renderHook(() =>
      useTemplatePoll({
        initialTemplate: pendingTemplate,
        shouldPoll: (t) => t.files.initialRender.status === 'PENDING',
        onUpdate,
      })
    );

    await act(() => Promise.resolve());

    expect(onUpdate).toHaveBeenCalledWith(updatedTemplate);
  });

  it('does not call onUpdate when fetch returns a non-ok response', async () => {
    jest.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const onUpdate = jest.fn();

    renderHook(() =>
      useTemplatePoll({
        initialTemplate: pendingTemplate,
        shouldPoll: () => true,
        onUpdate,
      })
    );

    await act(() => Promise.resolve());

    expect(onUpdate).not.toHaveBeenCalled();
  });
});
