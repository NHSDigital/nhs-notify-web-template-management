import { PropsWithChildren } from 'react';
import { Radios, Button, TextInput } from 'nhsuk-react-components';
import { FormState } from '../../../utils/types';

export type NHSNotifyFormWrapperProps = {
    formId: string;
    action: string | ((payload: FormData) => void);
};

export const NHSNotifyFormWrapper = ({
    children,
    action,
    formId,
}: PropsWithChildren<NHSNotifyFormWrapperProps>) => (
    <form action={action}>
        <input type='hidden' name='form-id' value={formId} />
        {children}
    </form>
);
