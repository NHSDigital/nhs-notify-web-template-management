import { JSX } from 'react';
import { ErrorSummary } from 'nhsuk-react-components';
import {
  templateMessageContainsInvalidPersonalisationErrorText,
  initialRenderContainsTooManySheetsError,
  shortRenderContainsTooManySheetsError,
  longRenderContainsTooManySheetsError,
} from '@content/content';
import { INVALID_PERSONALISATION_FIELDS } from '@utils/constants';
import { ErrorCodes } from '@utils/error-codes';
import { NhsNotifyErrorSummaryProps } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';

const invalidPersonalisationFieldNameComponent = (
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
);

const errorComponents: Record<string, JSX.Element> = {
  [ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME]:
    invalidPersonalisationFieldNameComponent,
  [ErrorCodes.INITIAL_RENDER_CONTAINS_TOO_MANY_SHEETS]: (
    <span className='nhsuk-error-message'>
      {initialRenderContainsTooManySheetsError.fieldText}
    </span>
  ),
  [ErrorCodes.SHORT_RENDER_CONTAINS_TOO_MANY_SHEETS]: (
    <span className='nhsuk-error-message'>
      {shortRenderContainsTooManySheetsError.fieldText}
    </span>
  ),
  [ErrorCodes.LONG_RENDER_CONTAINS_TOO_MANY_SHEETS]: (
    <span className='nhsuk-error-message'>
      {longRenderContainsTooManySheetsError.fieldText}
    </span>
  ),
};

const errorSummaryComponents: Record<string, (href?: string) => JSX.Element> = {
  [ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME]: (href) => (
    <li>
      <a href={href}>{invalidPersonalisationFieldNameComponent}</a>
    </li>
  ),
  [ErrorCodes.INITIAL_RENDER_CONTAINS_TOO_MANY_SHEETS]: (href) => (
    <>
      <div>{initialRenderContainsTooManySheetsError.labelText}</div>
      <ul className='nhsuk-error-message nhsuk-u-margin-bottom-4'>
        <li>{initialRenderContainsTooManySheetsError.actionText1}</li>
        <li>
          <a href={href}>
            {initialRenderContainsTooManySheetsError.actionText2}
          </a>
        </li>
      </ul>
    </>
  ),
  [ErrorCodes.SHORT_RENDER_CONTAINS_TOO_MANY_SHEETS]: (href) => (
    <>
      <div className='nhsuk-u-margin-bottom-3'>
        {shortRenderContainsTooManySheetsError.labelText}
      </div>
      <div className='nhsuk-error-message nhsuk-u-margin-bottom-4'>
        <a href={href}>{shortRenderContainsTooManySheetsError.actionText}</a>
      </div>
    </>
  ),
  [ErrorCodes.LONG_RENDER_CONTAINS_TOO_MANY_SHEETS]: (href) => (
    <>
      <div className='nhsuk-u-margin-bottom-3'>
        {longRenderContainsTooManySheetsError.labelText}
      </div>
      <div className='nhsuk-error-message nhsuk-u-margin-bottom-4'>
        <a href={href}>{longRenderContainsTooManySheetsError.actionText}</a>
      </div>
    </>
  ),
};

export const renderErrorItem = (error: string) =>
  errorComponents[error] || error;

export const renderErrorSummaryItemFormError = (error: string) =>
  errorSummaryComponents[error] ? (
    errorSummaryComponents[error]()
  ) : (
    <span className='nhsuk-error-message'>{error}</span>
  );

export const renderErrorSummaryItemFieldError = (
  error: string,
  id: string,
  onItemClick: NhsNotifyErrorSummaryProps['onItemClick']
) =>
  errorSummaryComponents[error] ? (
    errorSummaryComponents[error](`#${id}`)
  ) : (
    <ErrorSummary.Item
      href={`#${id}`}
      key={`field-error-summary-${id}-${error.slice(0, 5)}`}
      onClick={onItemClick?.(id)}
    >
      {error}
    </ErrorSummary.Item>
  );
