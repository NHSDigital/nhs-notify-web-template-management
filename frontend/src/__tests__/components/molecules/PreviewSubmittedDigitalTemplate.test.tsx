import { PreviewSubmittedDigitalTemplate } from '@molecules/PreviewSubmittedDigitalTemplate/PreviewSubmittedDigitalTemplate';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import {
  useCampaignIds,
  useFeatureFlags,
} from '@providers/client-config-provider';
import { render } from '@testing-library/react';

jest.mock('@providers/client-config-provider');

describe('PreviewSubmittedDigitalTemplate component', () => {
  describe.each([true, false])('routing = %s', (routing) => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(useFeatureFlags).mockReturnValue({ routing });
      jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
    });

    it('should render app message', () => {
      const container = render(
        <PreviewSubmittedDigitalTemplate
          template={{
            id: 'template-id',
            name: 'Example template',
            message: 'app content',
            templateStatus: 'SUBMITTED',
            templateType: 'NHS_APP',
            createdAt: '2025-01-13T10:19:25.579Z',
            updatedAt: '2025-01-13T10:19:25.579Z',
            lockNumber: 1,
          }}
          detailsComponent={PreviewTemplateDetailsNhsApp}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('should render email', () => {
      const container = render(
        <PreviewSubmittedDigitalTemplate
          template={{
            id: 'template-id',
            name: 'Example Email template',
            message: 'email content',
            subject: 'email subject',
            templateStatus: 'SUBMITTED',
            templateType: 'EMAIL',
            createdAt: '2025-01-13T10:19:25.579Z',
            updatedAt: '2025-01-13T10:19:25.579Z',
            lockNumber: 1,
          }}
          detailsComponent={PreviewTemplateDetailsEmail}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('should render sms', () => {
      const container = render(
        <PreviewSubmittedDigitalTemplate
          template={{
            id: 'template-id',
            name: 'SMS template',
            message: 'SMS content',
            templateStatus: 'SUBMITTED',
            templateType: 'SMS',
            createdAt: '2025-01-13T10:19:25.579Z',
            updatedAt: '2025-01-13T10:19:25.579Z',
            lockNumber: 1,
          }}
          detailsComponent={PreviewTemplateDetailsSms}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
