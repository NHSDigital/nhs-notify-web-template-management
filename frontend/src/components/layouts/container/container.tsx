export function NHSNotifyContainer({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const className = fullWidth
    ? 'nhsuk-width-container-fluid'
    : 'nhsuk-width-container';

  return <div className={className}>{children}</div>;
}
