import type { TemplateType } from 'nhs-notify-web-template-management-types';
import styles from './ChannelGuidance.module.scss';
import content from '@content/content';

export type ChannelGuidanceType = {
  template: TemplateType;
};

export function ChannelGuidance({ template }: ChannelGuidanceType) {
  const { channelGuidance } = content.components;

  return (
    <>
      <h2 className='nhsuk-heading-m'>{channelGuidance[template].heading}</h2>
      <ul className={styles['channel-guidance__list']}>
        {channelGuidance[template].guidanceLinks.map((guidanceLink) => (
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
