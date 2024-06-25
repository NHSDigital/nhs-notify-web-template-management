import { PropsWithChildren } from 'react';
import { Radios, Button, TextInput } from 'nhsuk-react-components';
import { FormState } from '../../../utils/types';

export type NHSNotifyBackButtonProps = {
    formId: string;
    action: string | ((payload: FormData) => void);
};

export const NHSNotifyBackButton = ({
    children,
    action,
    formId,
}: PropsWithChildren<NHSNotifyBackButtonProps>) => (
    <form action={action}>
        <input type='hidden' name='form-id' value={formId} />
        {children}
    </form>
);
