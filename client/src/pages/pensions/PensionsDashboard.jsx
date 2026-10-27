import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getEligibility } from '../../api/pensionsApi';

function PensionsDashboard() {
  const navigate = useNavigate();
  const { data: eligibility, loading, error } = useFetch(getEligibility, []);

  const showApply = eligibility?.eligible === true;

  return (
    <PageWrapper title="Pensions Services" accentColour="#7D3C98">
      <h1>Pensions services</h1>
      <p className="text-muted">
        View your pension and keep your verification up to date.
      </p>

      {loading && <StatsSkeleton count={2} />}

      {error && <Alert type="error" message={error} />}

      {!loading && !error && eligibility && (
        <>
          {eligibility.eligible ? (
            <div className="verification-status verified">
              <span className="verification-status-title">
                You qualify — {labelForCategory(eligibility.category)}
              </span>
              <span className="verification-status-subtitle">
                Your current age is {eligibility.currentAge}. Minimum age for this category is{' '}
                {eligibility.minimumAge}.
              </span>
              {eligibility.category === 'CIVIL_SERVICE' && (
                <span className="verification-status-subtitle">
                  Government service on record: {eligibility.governmentServiceYears} year
                  {eligibility.governmentServiceYears === 1 ? '' : 's'}.
                </span>
              )}
            </div>
          ) : (
            <div className="verification-status pending">
              <span className="verification-status-title">
                Not eligible at this time
              </span>
              <span className="verification-status-subtitle">
                {eligibility.message}
              </span>
              {eligibility.hasExistingPension && (
                <span className="verification-status-subtitle">
                  Existing pension status: {eligibility.existingPensionStatus || 'Recorded'}.
                </span>
              )}
              {eligibility.hasOutstandingDebt && (
                <span className="verification-status-subtitle">
                  Outstanding Finance debt: LSL {Number(eligibility.outstandingDebtAmount || 0).toFixed(2)}.
                  Resolve the debt with Finance before applying.
                </span>
              )}
              {eligibility.isCurrentGovernmentEmployee && (
                <span className="verification-status-subtitle">
                  Finance confirms current government employment. Old Age Pension is unavailable;
                  eligibility is assessed under the Civil Service Pension rules.
                </span>
              )}
            </div>
          )}

          <div className="services-grid" style={{ marginTop: 16 }}>
            <Card variant="bordered" className="service-card">
              <div className="service-card-body">
                <span className="service-card-name">Pension information</span>
                <span className="text-muted">
                  See your pension details and next payment date.
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/pensions/info')}
                >
                  View
                </button>
              </div>
            </Card>

            {showApply && (
              <Card variant="bordered" className="service-card">
                <div className="service-card-body">
                  <span className="service-card-name">Existence verification</span>
                  <span className="text-muted">
                    Confirm you are alive to keep receiving your pension.
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/pensions/verify')}
                  >
                    Verify now
                  </button>
                </div>
              </Card>
            )}

            <Card variant="bordered" className="service-card">
              <div className="service-card-body">
                <span className="service-card-name">Verification history</span>
                <span className="text-muted">
                  Previous life verifications on your record.
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/pensions/history')}
                >
                  View
                </button>
              </div>
            </Card>

            <Card variant="bordered" className="service-card">
              <div className="service-card-body">
                <span className="service-card-name">Pension application</span>
                <span className="text-muted">
                  {showApply
                    ? 'Apply for a pension.'
                    : 'Not available until you qualify.'}
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!showApply}
                  onClick={() => navigate('/citizen/services?ministry=PENSIONS')}
                >
                  Apply
                </button>
              </div>
            </Card>
          </div>
        </>
      )}

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/citizen/dashboard')}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}

function labelForCategory(code) {
  if (code === 'OLD_AGE') return 'Old Age Pension';
  if (code === 'CIVIL_SERVICE') return 'Civil Service Pension';
  return 'pension';
}

export default PensionsDashboard;