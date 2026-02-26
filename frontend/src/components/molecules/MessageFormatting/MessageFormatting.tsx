import content from '@content/content';
import type { TemplateType } from 'nhs-notify-web-template-management-types';
import { Details } from 'nhsuk-react-components';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { toKebabCase } from '@utils/kebab-case';

const messageFormattingContent = content.components.messageFormatting;

export function MessageFormatting({
  templateType,
}: {
  templateType: TemplateType;
}) {
  return (
    <>
      <h2
        className='nhsuk-heading-m nhsuk-u-margin-top-4'
        data-testid='message-formatting-header'
      >
        {messageFormattingContent.header}
      </h2>

      {messageFormattingContent.details
        .filter(
          (section) =>
            !section.showFor || section.showFor.includes(templateType)
        )
        .map((section) => {
          const id = toKebabCase(section.title);
          return (
            <Details data-testid={`${id}-details`} key={id}>
              <Details.Summary data-testid={`${id}-summary`}>
                {section.title}
              </Details.Summary>
              <Details.Text data-testid={`${id}-text`}>
                <ContentRenderer content={section.content} />
              </Details.Text>
            </Details>
          );
        })}
    </>
  );
}
