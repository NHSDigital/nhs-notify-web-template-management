/** This file is basically a proxy which allows components from
 * "nhsuk-react-components" to be imported into server-side code
 */

'use client';

import { Details, SummaryList, Table } from 'nhsuk-react-components';
export {
  Details,
  HintText,
  Label,
  SummaryList,
  Table,
  Tag,
} from 'nhsuk-react-components';

export const DetailsSummary = Details.Summary;
export const DetailsText = Details.Text;

export const SummaryListRow = SummaryList.Row;
export const SummaryListKey = SummaryList.Key;
export const SummaryListValue = SummaryList.Value;

export const TableHead = Table.Head;
export const TableRow = Table.Row;
export const TableBody = Table.Body;
export const TableCell = Table.Cell;
