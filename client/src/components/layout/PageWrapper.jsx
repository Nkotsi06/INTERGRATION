import AppShell from './AppShell';

function PageWrapper({
  children,
  title,
  showBack,
  backPath,
  accentColour,
  noPadding,
}) {
  return (
    <AppShell
      title={title}
      showBack={showBack}
      backPath={backPath}
      accentColour={accentColour}
    >
      <div className={`page-content ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </AppShell>
  );
}

export default PageWrapper;