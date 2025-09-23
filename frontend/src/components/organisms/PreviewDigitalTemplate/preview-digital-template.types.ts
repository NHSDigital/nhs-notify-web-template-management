import { NHSNotifyRadioButtonFormProps } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { TemplateDto } from 'nhs-notify-backend-client';

type Props = {
  sectionHeading: string | undefined;
  template: TemplateDto;
  previewDetailsComponent: React.ReactElement<
    | typeof PreviewTemplateDetailsEmail
    | typeof PreviewTemplateDetailsNhsApp
    | typeof PreviewTemplateDetailsSms
  >;
  routingEnabled: boolean;
  form?: NHSNotifyRadioButtonFormProps;
  editPath?: string;
};

type RoutingEnabled = Props & {
  routingEnabled: true;
  editPath: string;
};

type RoutingDisabled = Props & {
  routingEnabled: false;
  form: NHSNotifyRadioButtonFormProps;
};

export type PreviewTemplateProps = RoutingEnabled | RoutingDisabled;
