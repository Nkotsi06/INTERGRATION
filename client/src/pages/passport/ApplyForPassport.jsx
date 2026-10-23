import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import StepIndicator from '../../components/common/StepIndicator';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import SignaturePad from '../../components/signature/SignaturePad';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import useServiceFee from '../../hooks/useServiceFees';
import { getProfile } from '../../api/citizenApi';
import { getPublicBranches } from '../../api/serviceApi';
import { getMyCases } from '../../api/policeApi';
import { applyForPassport, getCurrentPassport } from '../../api/passportApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

const APPLICATIONS = {
  new: { code: 'PASSPORT_NEW', title: 'Apply for passport' },
  renewal: { code: 'PASSPORT_RENEWAL', title: 'Renew passport' },
  lost: { code: 'PASSPORT_LOST', title: 'Replace lost or stolen passport' },
  urgent: { code: 'PASSPORT_URGENT', title: 'Apply for an urgent passport' },
  minor: { code: 'PASSPORT_MINOR', title: 'Apply for a minor passport' },
};

function ApplyForPassport() {
  const { data: profile } = useFetch(getProfile, []);
  const { data: currentPassport, loading: passportLoading } = useFetch(getCurrentPassport, []);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success } = useNotification();
  const requestedType = searchParams.get('type') || 'new';
  const application = APPLICATIONS[requestedType] || APPLICATIONS.new;
  const isRenewal = ['PASSPORT_RENEWAL', 'PASSPORT_LOST'].includes(application.code);
  const isMinor = application.code === 'PASSPORT_MINOR';
  const { fee, currency, loading: feeLoading } = useServiceFee('PASSPORT', application.code);

  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [branchError, setBranchError] = useState(null);
  const [policeCases, setPoliceCases] = useState([]);
  const [caseLoading, setCaseLoading] = useState(application.code === 'PASSPORT_LOST');
  const [caseError, setCaseError] = useState(null);
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    passportType: 'ORDINARY',
    reason: '',
    collectionOffice: '',
    circumstances: '',
    policeCaseNumber: '',
    travelDate: '',
    travelReason: '',
    childFullName: '',
    childDateOfBirth: '',
    childNationalId: '',
    guardianFullName: '',
    guardianNationalId: '',
    guardianRelationship: '',
    signature: null,
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const eligibleCases = useMemo(
    () => policeCases.filter((item) =>
      ['LOST_PROPERTY', 'LOST', 'STOLEN', 'THEFT'].includes(
        String(item.case_type || '').toUpperCase()
      )
    ),
    [policeCases]
  );
  const selectedCollectionBranch = branches.find(
    (branch) => branch.id === details.collectionOffice
  );

  useEffect(() => {
    let cancelled = false;
    getPublicBranches('PASSPORT')
      .then((result) => {
        if (!cancelled) setBranches(Array.isArray(result) ? result : []);
      })
      .catch((err) => {
        if (!cancelled) setBranchError(err.message || 'Could not load Passport Office branches.');
      })
      .finally(() => {
        if (!cancelled) setBranchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (application.code !== 'PASSPORT_LOST') return undefined;
    let cancelled = false;
    getMyCases()
      .then((result) => {
        if (!cancelled) setPoliceCases(Array.isArray(result) ? result : []);
      })
      .catch((err) => {
        if (!cancelled) setCaseError(err.message || 'Could not load your police cases.');
      })
      .finally(() => {
        if (!cancelled) setCaseLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [application.code]);

  const update = (key, value) =>
    setDetails((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!details.collectionOffice) {
      setError('Choose a Passport Office collection branch.');
      return;
    }
    if (!profile?.nationalId) {
      setError('A Home Affairs National ID is required before applying.');
      return;
    }
    if (isRenewal && !currentPassport) {
      setError('No issued passport was found for this application.');
      return;
    }
    if (application.code === 'PASSPORT_LOST' &&
        (!details.policeCaseNumber || !details.circumstances.trim())) {
      setError('Choose your lost-property police case and explain the circumstances.');
      return;
    }
    if (application.code === 'PASSPORT_URGENT' &&
        (!details.travelDate || !details.travelReason.trim())) {
      setError('Enter your travel date and reason for an urgent passport.');
      return;
    }
    if (isMinor && (!details.childFullName.trim() || !details.childDateOfBirth ||
        !details.guardianFullName.trim() || !details.guardianNationalId.trim() ||
        !details.guardianRelationship.trim())) {
      setError('Complete the child and guardian details.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm the information before submitting.');
      return;
    }
    if (!details.signature) {
      setError('Please provide your signature before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await applyForPassport({
        ...details,
        serviceCode: application.code,
        isRenewal,
      });
      success('Application submitted');
      navigate('/passport/confirmation', { state: { result } });
    } catch (err) {
      setError(err.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title={application.title}
      showBack
      backPath="/passport/dashboard"
      accentColour="#17A2B8"
    >
      <h1>{application.title}</h1>

      <StepIndicator
        current={step}
        total={3}
        labels={['Review info', 'Application details', 'Review & submit']}
      />

      {error && <Alert type="error" message={error} />}
      {branchError && <Alert type="error" message={branchError} />}
      {caseError && <Alert type="error" message={caseError} />}

      {step === 1 && (
        <>
          <p className="text-muted">
            Your identity details are retrieved from Home Affairs.
          </p>
          <CitizenReadOnlyBlock citizen={profile} />
          <FormActions
            primaryLabel="Continue"
            onPrimary={() => setStep(2)}
            onSecondary={() => navigate('/passport/dashboard')}
          />
        </>
      )}

      {step === 2 && (
        <>
          {isRenewal && (
            <div className="card card-flat">
              <h3>Existing passport</h3>
              {passportLoading ? (
                <p className="text-muted">Loading your passport information…</p>
              ) : (
                <div className="form-grid">
                  <ReadOnly label="Passport number" value={currentPassport?.passport_number} />
                  <ReadOnly label="Passport type" value={currentPassport?.passport_type} />
                  <ReadOnly label="Collection branch" value={currentPassport?.collection_office} />
                </div>
              )}
            </div>
          )}

          <div className="form-grid">
            {!isMinor && (
              <Select
                label="Passport type"
                value={details.passportType}
                onChange={(event) => update('passportType', event.target.value)}
                options={[
                  { value: 'ORDINARY', label: 'Ordinary passport' },
                  { value: 'OFFICIAL', label: 'Official passport' },
                ]}
                required
              />
            )}
            <Select
              label="Collection branch"
              value={details.collectionOffice}
              onChange={(event) => update('collectionOffice', event.target.value)}
              options={branches.map((branch) => ({
                value: branch.id,
                label: `${branch.name}${branch.district ? ` — ${branch.district}` : ''}`,
              }))}
              disabled={branchLoading || branches.length === 0}
              required
            />

            {application.code === 'PASSPORT_LOST' && (
              <>
                <div className="form-grid-full">
                  <ReadOnly
                    label="Old passport number"
                    value={currentPassport?.passport_number}
                  />
                </div>
                {caseLoading ? (
                  <p className="text-muted">Loading your police cases…</p>
                ) : (
                  <Select
                    label="Police lost-property case"
                    value={details.policeCaseNumber}
                    onChange={(event) => update('policeCaseNumber', event.target.value)}
                    options={eligibleCases.map((item) => ({
                      value: item.case_number,
                      label: `${item.case_number} — ${item.case_type} (${item.status})`,
                    }))}
                    disabled={eligibleCases.length === 0}
                    required
                  />
                )}
                <div className="form-grid-full">
                  <label className="form-label" htmlFor="lost-passport-circumstances">
                    Circumstances
                  </label>
                  <textarea
                    id="lost-passport-circumstances"
                    className="form-input"
                    rows={4}
                    value={details.circumstances}
                    onChange={(event) => update('circumstances', event.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {application.code === 'PASSPORT_URGENT' && (
              <>
                <Input
                  label="Travel date"
                  type="date"
                  value={details.travelDate}
                  onChange={(event) => update('travelDate', event.target.value)}
                  required
                />
                <div className="form-grid-full">
                  <label className="form-label" htmlFor="urgent-travel-reason">
                    Reason for urgent travel
                  </label>
                  <textarea
                    id="urgent-travel-reason"
                    className="form-input"
                    rows={4}
                    value={details.travelReason}
                    onChange={(event) => update('travelReason', event.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {isMinor && (
              <>
                <Input
                  label="Child's full name"
                  value={details.childFullName}
                  onChange={(event) => update('childFullName', event.target.value)}
                  required
                />
                <Input
                  label="Child's date of birth"
                  type="date"
                  value={details.childDateOfBirth}
                  onChange={(event) => update('childDateOfBirth', event.target.value)}
                  required
                />
                <Input
                  label="Child's National ID (if issued)"
                  value={details.childNationalId}
                  onChange={(event) => update('childNationalId', event.target.value)}
                />
                <Input
                  label="Parent or guardian full name"
                  value={details.guardianFullName}
                  onChange={(event) => update('guardianFullName', event.target.value)}
                  required
                />
                <Input
                  label="Parent or guardian National ID"
                  value={details.guardianNationalId}
                  onChange={(event) => update('guardianNationalId', event.target.value)}
                  required
                />
                <Input
                  label="Relationship to child"
                  value={details.guardianRelationship}
                  onChange={(event) => update('guardianRelationship', event.target.value)}
                  required
                />
              </>
            )}

            <div className="form-section">
              <h3 className="form-section-title">Applicant signature</h3>
              <p className="text-muted">
                Sign to authorise this passport application.
              </p>
              <SignaturePad
                onSave={(signature) => update('signature', signature)}
                onClear={() => update('signature', null)}
              />
            </div>

            {(application.code === 'PASSPORT_NEW' ||
              application.code === 'PASSPORT_RENEWAL') && (
              <Input
                label="Reason for application"
                value={details.reason}
                onChange={(event) => update('reason', event.target.value)}
                full
              />
            )}
          </div>

          {feeLoading ? (
            <p className="text-muted">Loading application fee…</p>
          ) : fee > 0 ? (
            <div className="form-section">
              <h3 className="form-section-title">Application fee</h3>
              <p className="text-muted">
                {formatCurrency(fee, currency)} will be due after submission. Pay it from the Finance dashboard. No photo upload is required.
              </p>
            </div>
          ) : null}

          {application.code === 'PASSPORT_LOST' && eligibleCases.length === 0 && (
            <Alert
              type="warning"
              message="No lost-property police case was found. Report the loss to Police before applying."
            />
          )}

          <FormActions
            primaryLabel="Continue"
            primaryDisabled={branchLoading || branches.length === 0 ||
              (application.code === 'PASSPORT_LOST' &&
                (caseLoading || eligibleCases.length === 0))}
            onPrimary={() => setStep(3)}
            onSecondary={() => setStep(1)}
          />
        </>
      )}

      {step === 3 && (
        <>
          <div className="card card-flat">
            <h3>Application summary</h3>
            <div className="form-grid">
              <ReadOnly label="Applicant" value={profile?.fullName} />
              <ReadOnly label="National ID" value={profile?.nationalId} />
              {isRenewal && (
                <ReadOnly
                  label="Existing passport number"
                  value={currentPassport?.passport_number}
                />
              )}
              <ReadOnly
                label="Collection branch"
                value={selectedCollectionBranch
                  ? `${selectedCollectionBranch.name}${selectedCollectionBranch.district ? ` — ${selectedCollectionBranch.district}` : ''}`
                  : ''}
              />
              <ReadOnly label="Signature" value={details.signature ? 'Provided' : 'Missing'} />
              {isMinor && <ReadOnly label="Child" value={details.childFullName} />}
              {application.code === 'PASSPORT_LOST' && (
                <ReadOnly label="Police case" value={details.policeCaseNumber} />
              )}
              {fee > 0 && (
                <ReadOnly label="Application fee" value={formatCurrency(fee, currency)} />
              )}
            </div>
          </div>

          <Checkbox
            label="I confirm that the information and supporting identity records are correct."
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />

          <FormActions
            primaryLabel="Submit application"
            primaryLoading={submitting}
            onPrimary={handleSubmit}
            onSecondary={() => setStep(2)}
          />
        </>
      )}
    </PageWrapper>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default ApplyForPassport;
