/* eslint-disable jsx-a11y/anchor-is-valid,sonarjs/todo-tag */
/*
 * TODO: REMOVE ESLINT DISABLE WHEN WE HAVE FOOTER LINK
 */
import Link from 'next/link';
import content from '@content/content';

const footerContent = content.components.footer;

export function NHSNotifyFooter() {
  return (
    <footer role='contentinfo' data-testid='page-footer'>
      <div className='nhsuk-footer-container'>
        <div className='nhsuk-width-container'>
          <h2 className='nhsuk-u-visually-hidden' data-testid='support-links'>
            {footerContent.supportLinks}
          </h2>
          <div className='nhsuk-footer'>
            <ul className='nhsuk-footer__list'>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <a
                  className='nhsuk-footer__list-item-link'
                  href={footerContent.links.accessibilityStatement.url}
                  data-testid='accessibility-statement-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {footerContent.links.accessibilityStatement.text}
                </a>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <Link
                  className='nhsuk-footer__list-item-link'
                  href='#'
                  data-testid='contact-us-link'
                >
                  {footerContent.links.contactUs}
                </Link>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <Link
                  className='nhsuk-footer__list-item-link'
                  href='#'
                  data-testid='cookies-link'
                >
                  {footerContent.links.cookies}
                </Link>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <Link
                  className='nhsuk-footer__list-item-link'
                  href='#'
                  data-testid='privacy-policy-link'
                >
                  {footerContent.links.privacyPolicy}
                </Link>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <Link
                  className='nhsuk-footer__list-item-link'
                  href='#'
                  data-testid='terms-and-conditions-link'
                >
                  {footerContent.links.termsAndCondition}
                </Link>
              </li>
            </ul>
            <p
              className='nhsuk-footer__copyright'
              data-testid='nhs-england-copyright-text'
            >
              &copy; {footerContent.nhsEngland}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
