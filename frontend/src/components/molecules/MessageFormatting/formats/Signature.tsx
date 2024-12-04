import { Details } from 'nhsuk-react-components';
import content from '@content/content';

const { signatures } = content.components.messageFormattingComponent;

export const Signature = () => (
  <Details data-testid='signatures-details'>
    <Details.Summary data-testid='signatures-summary'>
      {signatures.title}
    </Details.Summary>
    <Details.Text data-testid='signatures-text'>
      <p>{signatures.text}</p>
      <code>{signatures.codeBlockText}</code>
    </Details.Text>
  </Details>
);
