import { LogoutWarningModal } from '@molecules/LogoutWarningModal/LogoutWarningModal';
import { fetchAuthSession } from 'aws-amplify/auth';

export default async function Page() {
  const session = await fetchAuthSession();

  return (
    <LogoutWarningModal authenticated={session.tokens?.accessToken !== null} />
  );
}
