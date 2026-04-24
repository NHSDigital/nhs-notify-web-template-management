import { render, screen } from '@testing-library/react';
import { LetterRenderDetails } from '@molecules/LetterRender/LetterRenderDetails';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

const baseTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
  campaignId: 'campaign',
  clientId: 'client-123',
  name: 'Test Letter',
  templateStatus: 'NOT_YET_SUBMITTED',
  templateType: 'LETTER',
  letterType: 'x0',
  letterVersion: 'AUTHORING',
  letterVariantId: 'variant-123',
  language: 'en',
  files: {
    docxTemplate: {
      currentVersion: 'version-id',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      status: 'RENDERED',
      currentVersion: '1234',
      fileName: '1234.pdf',
      pageCount: 1,
    },
    shortFormRender: {
      status: 'RENDERED',
      currentVersion: 'short-version',
      fileName: 'short.pdf',
      pageCount: 1,
      systemPersonalisationPackId: 'short-1',
      personalisationParameters: {
        appointmentDate: '2025-01-15',
        clinicName: 'Riverside Clinic',
      },
    },
    longFormRender: {
      status: 'RENDERED',
      currentVersion: 'long-version',
      fileName: 'long.pdf',
      pageCount: 2,
      systemPersonalisationPackId: 'long-1',
      personalisationParameters: {
        appointmentDate: '2025-02-20',
      },
    },
  },
  systemPersonalisation: ['firstName', 'lastName'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('LetterRenderDetails', () => {
  describe('PDS personalisation section', () => {
    it('renders the selected short example recipient name', () => {
      render(
        <LetterRenderDetails template={baseTemplate} tab='shortFormRender' />
      );

      expect(
        screen.getByRole('heading', { name: 'PDS personalisation fields' })
      ).toBeInTheDocument();
      expect(screen.getByText('Jo Bloggs')).toBeInTheDocument();
    });

    it('renders the selected long example recipient name', () => {
      render(
        <LetterRenderDetails template={baseTemplate} tab='longFormRender' />
      );

      expect(
        screen.getByText('Mr Michael James Richardson-Clarke')
      ).toBeInTheDocument();
    });
  });

  describe('Custom personalisation section', () => {
    it('renders custom field labels and values when present', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate', 'clinicName'],
      };

      render(
        <LetterRenderDetails
          template={templateWithCustom}
          tab='shortFormRender'
        />
      );

      expect(
        screen.getByRole('heading', { name: 'Custom personalisation fields' })
      ).toBeInTheDocument();
      expect(screen.getByText('appointmentDate')).toBeInTheDocument();
      expect(screen.getByText('2025-01-15')).toBeInTheDocument();
      expect(screen.getByText('clinicName')).toBeInTheDocument();
      expect(screen.getByText('Riverside Clinic')).toBeInTheDocument();
    });

    it('does not render the custom section when customPersonalisation is missing', () => {
      render(
        <LetterRenderDetails template={baseTemplate} tab='shortFormRender' />
      );

      expect(
        screen.queryByRole('heading', { name: 'Custom personalisation fields' })
      ).not.toBeInTheDocument();
    });

    it('does not render the custom section when customPersonalisation is empty', () => {
      const templateWithEmptyCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: [],
      };

      render(
        <LetterRenderDetails
          template={templateWithEmptyCustom}
          tab='shortFormRender'
        />
      );

      expect(
        screen.queryByRole('heading', { name: 'Custom personalisation fields' })
      ).not.toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('matches snapshot', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      const container = render(
        <LetterRenderDetails
          template={templateWithCustom}
          tab='shortFormRender'
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
