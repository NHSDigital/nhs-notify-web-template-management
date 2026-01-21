/** This file is basically a proxy which allows components from
 * "nhsuk-react-components" to be imported into server-side code
 */

'use client';

import { Details, SummaryList } from 'nhsuk-react-components';
export { Details, SummaryList, Tag } from 'nhsuk-react-components';

export const DetailsSummary = Details.Summary;
export const DetailsText = Details.Text;

export const SummaryListRow = SummaryList.Row;
export const SummaryListKey = SummaryList.Key;
export const SummaryListValue = SummaryList.Value;
