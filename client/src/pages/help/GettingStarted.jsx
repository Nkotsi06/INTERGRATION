import PageWrapper from '../../components/layout/PageWrapper';

function HelpGettingStarted() {
  return (
    <PageWrapper title="Getting Started" showBack backPath="/help">
      <h1>Getting started</h1>

      <div className="form-section">
        <h3 className="form-section-title">1. Create an account</h3>
        <p>
          Open the welcome page and choose <strong>Register</strong>. Enter a
          username, your email address, and a password with at least eight
          characters including one number.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">2. Visit Home Affairs</h3>
        <p>
          Bring your identity document and birth certificate to the nearest
          Home Affairs office. An officer will capture your details, take your
          photo, and issue your National ID.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">3. Log in and use services</h3>
        <p>
          Once Home Affairs has verified you, log in and open the Citizen
          Dashboard. Every service you are eligible for appears as a card.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Need more help?</h3>
        <p>
          Visit the <a href="/help/offices">offices page</a> for contact
          details, or return to the <a href="/help">Help home</a>.
        </p>
      </div>
    </PageWrapper>
  );
}

export default HelpGettingStarted;