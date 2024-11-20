import { TemplateType } from '@utils/enum';
import { channelGuidanceContent } from '@content/content';
import Link from 'next/link';

export type TemplateTypeNoLetters = Exclude<TemplateType, TemplateType.LETTER>;

export type ChannelGuidanceType = {
  template: TemplateTypeNoLetters;
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
            <Link href={guidanceLink.link} target='_blank'>
              {guidanceLink.text}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
