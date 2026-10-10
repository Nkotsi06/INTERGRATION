import PageWrapper from './PageWrapper';

function AdminLayout({ children, title, showBack, backPath }) {
  return (
    <PageWrapper
      title={title}
      showBack={showBack}
      backPath={backPath}
      accentColour="#2F3A44"
    >
      {children}
    </PageWrapper>
  );
}

export default AdminLayout;