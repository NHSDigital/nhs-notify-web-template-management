export async function NHSNotifyContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='nhsuk-width-container'>
      <main
        className='nhsuk-main-wrapper nhsuk-u-padding-top-4'
        id='maincontent'
        role='main'
      >
        {process.env.FEATURE_VISIBILITY_TESTING === 'on' ? (
          <h1>Coming soon</h1>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
