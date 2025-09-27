import classNames from 'classnames';
import { Details } from 'nhsuk-react-components';
import { FallbackConditionBlock } from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';

import styles from '@molecules/MessagePlanFallbackConditions/MessagePlanFallbackConditions.module.scss';

export function MessagePlanFallbackConditions({
  title,
  content,
}: FallbackConditionBlock) {
  return (
    <li className='notify-channel-block notify-channel-block__rules'>
      <div className='notify-channel-block-outer'>
        <div className='notify-channel-block-channel' aria-hidden='true'>
          <div
            className={classNames(
              styles['fallback-conditions-branch-icon'],
              'notify-channel-block-icon-branch'
            )}
          >
            <svg
              viewBox='0 0 499.694748 700.749167'
              version='1.1'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g
                id='Page-1'
                stroke='none'
                stroke-width='1'
                fill='none'
                fill-rule='evenodd'
              >
                <g
                  id='branch-svgrepo-com'
                  transform='translate(250.007401, 350.374584) scale(-1, 1) rotate(90.000000) translate(-250.007401, -350.374584) translate(-149.992599, -49.625416)'
                >
                  <path
                    d='M650,450 C604.526092,450.130889 564.879924,480.959947 553.55,525 L450,525 C408.597492,524.954532 375.045468,491.402508 375,450 L375,350 C374.90465,322.865486 365.895962,296.514017 349.36,275 L553.55,275 C566.139176,323.757668 613.019668,355.54813 662.975013,349.20297 C712.930358,342.857809 750.374584,300.356703 750.374584,250 C750.374584,199.643297 712.930358,157.142191 662.975013,150.79703 C613.019668,144.45187 566.139176,176.242332 553.55,225 L246.45,225 C233.860824,176.242332 186.980332,144.45187 137.024987,150.79703 C87.0696422,157.142191 49.6254163,199.643297 49.6254163,250 C49.6254163,300.356703 87.0696422,342.857809 137.024987,349.20297 C186.980332,355.54813 233.860824,323.757668 246.45,275 L250,275 C291.402508,275.045468 324.954532,308.597492 325,350 L325,450 C325.081278,519.001899 380.998101,574.918722 450,575 L553.55,575 C566.624846,625.202218 615.96959,657.0262 667.095128,648.228835 C718.220666,639.431469 754.090123,592.944356 749.632835,541.259282 C745.175547,489.574208 701.876844,449.914506 650,450 Z M650,200 C677.614237,200 700,222.385763 700,250 C700,277.614237 677.614237,300 650,300 C622.385763,300 600,277.614237 600,250 C600.031687,222.398898 622.398898,200.031687 650,200 Z M150,300 C122.385763,300 100,277.614237 100,250 C100,222.385763 122.385763,200 150,200 C177.614237,200 200,222.385763 200,250 C199.972439,277.602813 177.602813,299.972439 150,300 L150,300 Z M650,600 C622.385763,600 600,577.614237 600,550 C600,522.385763 622.385763,500 650,500 C677.614237,500 700,522.385763 700,550 C699.962817,577.598821 677.598821,599.962817 650,600 Z'
                    id='Shape'
                    fill='#000000'
                    fill-rule='nonzero'
                  ></path>
                  <rect
                    id='_Transparent_Rectangle_'
                    x='0'
                    y='0'
                    width='800'
                    height='800'
                  ></rect>
                </g>
              </g>
            </svg>
          </div>
        </div>
        <Details>
          <Details.Summary>{title}</Details.Summary>
          <Details.Text>
            <ul className='nhsuk-list nhsuk-list--tick'>
              {content.stop && (
                <li>
                  <svg
                    className='nhsuk-icon nhsuk-icon__tick'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    aria-hidden='true'
                    width='34'
                    height='34'
                  >
                    <path
                      stroke-width='4'
                      stroke-linecap='round'
                      d='M18.4 7.8l-8.5 8.4L5.6 12'
                      stroke='#007f3b'
                    />
                  </svg>
                  <ContentRenderer content={content.stop} />
                </li>
              )}
              {content.continue && (
                <li>
                  <svg
                    transform='rotate(90)'
                    className='nhsuk-icon nhsuk-icon__arrow-right'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                    width='34'
                    height='34'
                  >
                    <path d='M19.6 11.66l-2.73-3A.51.51 0 0 0 16 9v2H5a1 1 0 0 0 0 2h11v2a.5.5 0 0 0 .32.46.39.39 0 0 0 .18 0 .52.52 0 0 0 .37-.16l2.73-3a.5.5 0 0 0 0-.64z' />
                  </svg>
                  <ContentRenderer content={content.continue} />
                </li>
              )}
            </ul>
          </Details.Text>
        </Details>
      </div>
    </li>
  );
}
