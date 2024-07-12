import { PropsWithChildren } from 'react';
import { ChevronLeftIcon } from 'nhsuk-react-components';
import { NHSNotifyFormWrapper } from '../NHSNotifyFormWrapper/NHSNotifyFormWrapper';

export type NHSNotifyBackButtonProps = {
  formId: string;
  action: string | ((payload: FormData) => void);
};

export const NHSNotifyBackButton = ({
  children,
  action,
  formId,
}: PropsWithChildren<NHSNotifyBackButtonProps>) => (
  <div className='nhsuk-back-link nhsuk-u-margin-bottom-7 nhsuk-u-padding-left-3'>
    <NHSNotifyFormWrapper action={action} formId={formId}>
      {children}
      <button type='submit' className='nhsuk-back-link__link'>
        <ChevronLeftIcon />
        Go back
      </button>
    </NHSNotifyFormWrapper>
  </div>
);
