import { LogoutWarningModal } from '@molecules/LogoutWarningModal/LogoutWarningModal';
import { fetchAuthSession } from 'aws-amplify/auth';

export default async function Page() {
  const session = await fetchAuthSession();

  console.log('INNVOKED');

  return (
    <LogoutWarningModal
      authenticated={session.tokens?.accessToken !== null}
      warningTimeoutInSeconds={5}
      autoLogoutInSeconds={10}
    />
  );
}
