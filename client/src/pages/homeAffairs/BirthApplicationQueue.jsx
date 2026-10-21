import { useCallback, useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import Input from '../../components/common/Input';
import {
  getBirthApplications,
  getBirthApplicationDocumentUrl,
  reviewBirthApplication,
} from '../../api/birthApplicationApi';
import { useNotification } from '../../context/NotificationContext';

const DOCUMENT_LABELS = {
  parentNationalIds: 'Parents’ National ID(s)',
  religiousConfirmation: 'Religious confirmation letter',
  chiefLetter: 'Chief’s letter',
  medicalOrHealth: 'Medical certificate / health booklet',
};

function BirthApplicationQueue() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reasons, setReasons] = useState({});
  const [outcomes, setOutcomes] = useState({});
  const [error, setError] = useState(null);
  const { success, error: showError } = useNotification();

  const load = useCallback(async () => {
    setError(null);
    try {
      setApplications(await getBirthApplications());
    } catch (requestError) {
      setError(requestError.message || 'Could not load birth certificate applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (application, decision) => {
    if (decision === 'REJECT' && !reasons[application.id]?.trim()) {
      showError('Enter a reason before rejecting the application.');
      return;
    }
    setBusyId(application.id);
    try {
      const result = await reviewBirthApplication(
        application.id,
        decision,
        reasons[application.id]
      );
      setOutcomes((current) => ({ ...current, [application.id]: result }));
      success(decision === 'APPROVE' ? 'Birth certificate approved and issued.' : 'Application rejected.');
      await load();
    } catch (requestError) {
      showError(requestError.message || 'Could not process this application.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageWrapper title="Birth certificate applications" showBack backPath="/home-affairs/dashboard">
      <h1>Birth certificate applications</h1>
      <p className="text-muted">Review the uploaded documents and application details. Approval creates the citizen ID, account, and digital certificate.</p>
      {error && <Alert type="error" message={error} />}
      {loading ? <p>Loading applications…</p> : applications.length === 0 ? (
        <p className="text-muted">There are no birth certificate applications to review.</p>
      ) : applications.map((application) => (
        <section className="card card-flat" key={application.id} style={{ marginBottom: 18, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2>{application.form_data.firstName} {application.form_data.lastName}</h2>
              <p><strong>Reference:</strong> {application.reference_number}</p>
              <p><strong>Date of birth:</strong> {application.form_data.dateOfBirth}</p>
              <p><strong>Applicant:</strong> {application.form_data.applicantFullName || application.form_data.applicantType} · {application.form_data.applicantEmail}</p>
            </div>
            <StatusBadge variant={application.status.toLowerCase()} label={application.status.replace(/_/g, ' ')} />
          </div>

          <details>
            <summary>Application details and uploaded documents</summary>
            <p><strong>Place of birth:</strong> {application.form_data.placeOfBirth}</p>
            <p><strong>Mother / parent:</strong> {application.form_data.motherFullName} {application.form_data.motherNationalId && `(${application.form_data.motherNationalId})`}</p>
            <p><strong>Father / parent:</strong> {application.form_data.fatherFullName || 'Not provided'} {application.form_data.fatherNationalId && `(${application.form_data.fatherNationalId})`}</p>
            {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <strong>{label}: </strong>
                {(application.documents?.[key] || []).map((file, index) => (
                  <a
                    key={`${file.name}-${index}`}
                    href={getBirthApplicationDocumentUrl(application.id, key, index)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ marginRight: 10 }}
                  >
                    {file.name || `File ${index + 1}`}
                  </a>
                ))}
              </div>
            ))}
          </details>

          {application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW' ? (
            <div style={{ marginTop: 16 }}>
              <Input
                label="Rejection reason (required if rejecting)"
                value={reasons[application.id] || ''}
                onChange={(event) => setReasons((current) => ({
                  ...current,
                  [application.id]: event.target.value,
                }))}
              />
              <div className="form-actions">
                <Button variant="primary" disabled={busyId === application.id} onClick={() => decide(application, 'APPROVE')}>
                  {busyId === application.id ? 'Processing…' : 'Approve and issue certificate'}
                </Button>
                <Button variant="danger" disabled={busyId === application.id} onClick={() => decide(application, 'REJECT')}>
                  Reject
                </Button>
              </div>
            </div>
          ) : null}

          {application.rejection_reason && (
            <Alert type="error" title="Rejected" message={application.rejection_reason} />
          )}
          {outcomes[application.id]?.status === 'APPROVED' && (
            <Alert
              type="success"
              title="Issue credentials to applicant securely"
              message={`National ID: ${outcomes[application.id].nationalId} · Certificate: ${outcomes[application.id].certificateNumber} · Username: ${outcomes[application.id].username} · Temporary password: ${outcomes[application.id].temporaryPassword}. Share these with ${outcomes[application.id].applicantEmail}; the password is shown once and must be changed at first sign-in.`}
            />
          )}
        </section>
      ))}
    </PageWrapper>
  );
}

export default BirthApplicationQueue;
