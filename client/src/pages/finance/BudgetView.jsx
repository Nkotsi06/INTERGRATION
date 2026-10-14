import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getBudget, getBudgetStats } from '../../api/financeApi';
import { formatCurrency } from '../../utils/formatters';

function BudgetView() {
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString());
  const { data: rows, loading, error } = useFetch(
    () => getBudget({ fiscalYear }),
    [fiscalYear]
  );
  const { data: stats, error: statsError } = useFetch(
    () => getBudgetStats(fiscalYear),
    [fiscalYear]
  );

  const columns = [
    { key: 'ministry_code', label: 'Ministry' },
    { key: 'recurrent_budget', label: 'Recurrent budget',
      render: (row) => formatCurrency(row.recurrent_budget) },
    { key: 'capital_budget', label: 'Capital budget',
      render: (row) => formatCurrency(row.capital_budget) },
    { key: 'total_budget', label: 'Total budget',
      render: (row) => formatCurrency(row.total_budget) },
    { key: 'expenditure_to_date', label: 'Spent to date',
      render: (row) => formatCurrency(row.expenditure_to_date) },
    { key: 'remaining', label: 'Remaining',
      render: (row) => formatCurrency(Number(row.total_budget) - Number(row.expenditure_to_date)) },
    { key: 'status', label: 'Status' },
  ];

  return (
    <PageWrapper title="Budget Allocations" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Budget allocations</h1>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label" htmlFor="budget-fiscal-year">Fiscal year</label>
            <input
              id="budget-fiscal-year"
              className="filter-select"
              value={fiscalYear}
              onChange={(event) => setFiscalYear(event.target.value)}
            />
          </div>
        </div>
      </div>

      {statsError ? (
        <p className="text-error" role="alert">Unable to load budget totals: {statsError}</p>
      ) : (
        <div className="stats-grid">
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{formatCurrency(stats?.total_budget ?? 0)}</div>
              <div className="stat-label">Total budget</div>
            </div>
          </Card>
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{formatCurrency(stats?.total_spent ?? 0)}</div>
              <div className="stat-label">Spent to date</div>
            </div>
          </Card>
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{formatCurrency(stats?.remaining ?? 0)}</div>
              <div className="stat-label">Remaining</div>
            </div>
          </Card>
        </div>
      )}

      {error ? (
        <p className="text-error" role="alert">Unable to load budget allocations: {error}</p>
      ) : loading ? (
        <p className="text-muted">Loading…</p>
      ) : rows?.length ? (
        <Table columns={columns} data={rows} />
      ) : (
        <EmptyState title="No budget allocations" message="No allocations were found for this fiscal year." />
      )}
    </PageWrapper>
  );
}

export default BudgetView;