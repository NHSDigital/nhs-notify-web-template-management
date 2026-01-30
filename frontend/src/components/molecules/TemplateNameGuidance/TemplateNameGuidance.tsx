import type { HTMLProps } from 'react';
import type { TemplateType } from 'nhs-notify-backend-client';
import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';

export function TemplateNameGuidance({
  templateType,
  ...props
}: Omit<HTMLProps<HTMLDetailsElement>, 'children'> & {
  templateType?: TemplateType;
}) {
  const { summary, text } =
    content.components.templateNameGuidance(templateType);

  return (
    <Details {...props}>
      <Details.Summary>{summary}</Details.Summary>
      <Details.Text>
        <ContentRenderer content={text} />
      </Details.Text>
    </Details>
  );
}
