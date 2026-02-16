'use client';

import { ErrorPage404 } from '@molecules/404/404';
import { NHSNotifyContainer } from '@layouts/container/container';

const InvalidTemplatePage = () => (
  <NHSNotifyContainer>
    <ErrorPage404 />
  </NHSNotifyContainer>
);

export default InvalidTemplatePage;
