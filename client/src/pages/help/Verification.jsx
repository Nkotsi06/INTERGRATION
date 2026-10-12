import PageWrapper from '../../components/layout/PageWrapper';

function HelpVerification() {
  return (
    <PageWrapper title="Identity Verification" showBack backPath="/help">
      <h1>Identity verification</h1>

      <p>
        Home Affairs is the master source of verified citizen identity. All
        other ministries trust that record — you never re-submit your documents
        to another ministry.
      </p>

      <div className="form-section">
        <h3 className="form-section-title">What verification means</h3>
        <ul>
          <li>Your National ID has been issued.</li>
          <li>An officer has checked your ID and birth certificate.</li>
          <li>Your photo and (optionally) fingerprints are on file.</li>
        </ul>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">What you need to bring</h3>
        <ul>
          <li>Your original identity document or birth certificate.</li>
          <li>Proof of address (utility bill, letter from the chief).</li>
          <li>
            If you are renewing, bring the previous National ID if available.
          </li>
        </ul>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">After verification</h3>
        <p>
          You will receive a notification in the app. Open any service on your
          dashboard to begin.
        </p>
      </div>
    </PageWrapper>
  );
}

export default HelpVerification;