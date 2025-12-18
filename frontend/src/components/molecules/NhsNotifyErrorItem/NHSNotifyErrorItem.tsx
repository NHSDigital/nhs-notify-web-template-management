import { JSX } from 'react';
import { templateMessageContainsInvalidPersonalisationErrorText } from '@content/content';
import { INVALID_PERSONALISATION_FIELDS } from '@utils/constants';
import { ErrorCodes } from '@utils/error-codes';

const errorComponents: Record<string, JSX.Element> = {
  [ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME]: (
    <>
      <div className='nhsuk-u-margin-top-1 nhsuk-u-margin-bottom-4'>
        {templateMessageContainsInvalidPersonalisationErrorText}
      </div>
      <ul className='nhsuk-list nhsuk-list--bullet'>
        {INVALID_PERSONALISATION_FIELDS.map((item) => (
          <li
            key={`personalisation-field-${item.toLowerCase().replace('_', '')}`}
            className='nhsuk-u-margin-bottom-0'
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  ),
};

export const renderErrorItem = (error: string) =>
  errorComponents[error] || error;
