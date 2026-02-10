'use client';

import { NHSNotifyContainer } from '@layouts/container/container';
import { ErrorPage404 } from '@molecules/404/404';

const InvalidMessagePlanPage = () => (
  <NHSNotifyContainer>
    <ErrorPage404 />
  </NHSNotifyContainer>
);

export default InvalidMessagePlanPage;
