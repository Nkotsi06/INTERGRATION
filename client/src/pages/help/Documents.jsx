import PageWrapper from '../../components/layout/PageWrapper';

function HelpDocuments() {
  return (
    <PageWrapper title="Documents and Uploads" showBack backPath="/help">
      <h1>Documents and uploads</h1>

      <div className="form-section">
        <h3 className="form-section-title">Accepted formats</h3>
        <p>
          PDF, JPG, JPEG, and PNG. Maximum file size is 5 MB per document.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Recommended file names</h3>
        <p>
          Use descriptive names like <code>national-id-front.jpg</code> or{' '}
          <code>birth-certificate.pdf</code>. Avoid spaces and special
          characters.
        </p>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">How to upload</h3>
        <ol>
          <li>Open the service you are applying for.</li>
          <li>Find the document type in the Documents section.</li>
          <li>Click the drop zone, or click "Click to select file".</li>
          <li>Choose your file and click Upload.</li>
        </ol>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">If an upload fails</h3>
        <ul>
          <li>Check that the file is under 5 MB.</li>
          <li>Check that the file type is PDF, JPG, JPEG, or PNG.</li>
          <li>
            If the problem persists, bring the original document to the office.
          </li>
        </ul>
      </div>
    </PageWrapper>
  );
}

export default HelpDocuments;