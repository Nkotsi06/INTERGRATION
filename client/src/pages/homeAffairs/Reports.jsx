import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import DatePicker from '../../components/common/DatePicker';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import useFetch from '../../hooks/useFetch';
import { getReports } from '../../api/homeAffairsApi';

function HAReports() {
  const [type, setType] = useState('verification-summary');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: report, loading, refetch } = useFetch(
    () => getReports({ type, fromDate, toDate }),
    []
  );

  const handleGenerate = () => refetch();

  const handleClear = () => {
    setType('verification-summary');
    setFromDate('');
    setToDate('');
  };

  return (
    <PageWrapper
      title="Reports"
      showBack
      backPath="/home-affairs/dashboard"
      accentColour="#1A5276"
    >
      <h1>Reports</h1>
      <p className="text-muted">
        Prepare a report of citizen registrations and verifications.
      </p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Report type</label>
            <select
              className="filter-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="verification-summary">
                Citizen verification summary
              </option>
              <option value="registrations">Registrations</option>
              <option value="pending">Pending verifications</option>
            </select>
          </div>

          <div className="filter-date-range">
            <label className="filter-label">Date range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="filter-date-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span className="date-range-sep">to</span>
              <input
                type="date"
                className="filter-date-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button variant="primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate preview'}
        </Button>
        <button
          type="button"
          className="clear-filters"
          onClick={handleClear}
        >
          Clear filters
        </button>
      </div>

      <div className="stats-grid" style={{ marginTop: 24 }}>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{report?.citizensRegistered ?? 0}</div>
            <div className="stat-label">Citizens registered</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{report?.citizensVerified ?? 0}</div>
            <div className="stat-label">Citizens verified</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{report?.pending ?? 0}</div>
            <div className="stat-label">Pending</div>
          </div>
        </Card>
      </div>

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <Button variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="primary">Export</Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default HAReports;