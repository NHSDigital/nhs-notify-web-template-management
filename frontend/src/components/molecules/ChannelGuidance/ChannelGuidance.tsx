import { TemplateType } from 'nhs-notify-web-template-management-utils';
import { channelGuidanceContent } from '@content/content';

export type ChannelGuidanceType = {
  template: TemplateType;
};

export function ChannelGuidance({ template }: ChannelGuidanceType) {
  return (
    <>
      <h2 className='nhsuk-heading-m'>
        {channelGuidanceContent[template].heading}
      </h2>

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {channelGuidanceContent[template].guidanceLinks.map((guidanceLink) => (
          <li className='nhsuk-u-margin-bottom-3' key={guidanceLink.text}>
            <a
              href={guidanceLink.link}
              target='_blank'
              rel='noopener noreferrer'
            >
              {guidanceLink.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
