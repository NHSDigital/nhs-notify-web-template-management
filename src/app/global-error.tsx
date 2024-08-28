'use client';

import Link from 'next/link';

export default function GlobalError() {
  return (
    <>
      <h1 className='nhsuk-heading-xl'>Something went wrong</h1>
      <h2>What you can do:</h2>
      <ul>
        <li>refresh the page</li>
        <li>
          <Link href='/create-and-submit-templates'>go to the start page</Link>{' '}
          and try again
        </li>
      </ul>
      <p> If the problem continues contact us:</p>
      <h3>By email</h3>
      <p>
        <Link
          href={`mailto:ssd.nationalservicedesk@nhs.net?subject=Unexpected error - Digest: `}
        >
          ssd.nationalservicedesk@nhs.net
        </Link>
      </p>
    </>
  );
}
