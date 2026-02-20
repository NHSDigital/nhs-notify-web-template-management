import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { DigitalTemplate } from 'nhs-notify-web-template-management-utils';

export type PreviewTemplateProps = {
  sectionHeading: string | undefined;
  template: DigitalTemplate;
  previewDetailsComponent: React.ReactElement<
    | typeof PreviewTemplateDetailsEmail
    | typeof PreviewTemplateDetailsNhsApp
    | typeof PreviewTemplateDetailsSms
  >;
  form: NHSNotifyRadioButtonFormProps;
  editPath: string;
};
