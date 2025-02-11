import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export function NHSNotifyContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='nhsuk-width-container'>
      {process.env.NEXT_PUBLIC_DISABLE_CONTENT === 'true' ? (
        <NHSNotifyMain>
          <h1>Coming soon</h1>
        </NHSNotifyMain>
      ) : (
        children
      )}
    </div>
  );
}
