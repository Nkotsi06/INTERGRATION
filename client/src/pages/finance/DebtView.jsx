import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getDebt, getDebtStats } from '../../api/financeApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TYPE_LABEL = { LOAN: 'Loan', AID: 'Aid', GRANT: 'Grant' };

function DebtView() {
  const { data: rows, loading } = useFetch(getDebt, []);
  const { data: stats } = useFetch(getDebtStats, []);
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => !typeFilter || r.record_type === typeFilter);
  }, [rows, typeFilter]);

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'record_type', label: 'Type',
      render: (r) => TYPE_LABEL[r.record_type] || r.record_type },
    { key: 'lender_name', label: 'Lender / Donor' },
    { key: 'principal_amount', label: 'Principal',
      render: (r) => formatCurrency(r.principal_amount) },
    { key: 'outstanding_amount', label: 'Outstanding',
      render: (r) => formatCurrency(r.outstanding_amount) },
    { key: 'start_date', label: 'Start',
      render: (r) => (r.start_date ? formatDate(r.start_date) : '—') },
    { key: 'maturity_date', label: 'Maturity',
      render: (r) => (r.maturity_date ? formatDate(r.maturity_date) : '—') },
    { key: 'status', label: 'Status' },
  ];

  return (
    <PageWrapper title="Debt & Aid" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Debt and aid</h1>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{formatCurrency(stats?.total_loans ?? 0)}</div>
            <div className="stat-label">Total loans</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{formatCurrency(stats?.outstanding_loans ?? 0)}</div>
            <div className="stat-label">Outstanding</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{formatCurrency(stats?.total_aid ?? 0)}</div>
            <div className="stat-label">Aid received</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{formatCurrency(stats?.total_grants ?? 0)}</div>
            <div className="stat-label">Grants</div>
          </div>
        </Card>
      </div>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Type</label>
            <select className="filter-select" value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All</option>
              <option value="LOAN">Loans</option>
              <option value="AID">Aid</option>
              <option value="GRANT">Grants</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <p className="text-muted">Loading…</p>
        : filtered.length === 0
          ? <EmptyState title="No debt or aid records" message="Nothing to show." />
          : <Table columns={columns} data={filtered} />}
    </PageWrapper>
  );
}

export default DebtView;