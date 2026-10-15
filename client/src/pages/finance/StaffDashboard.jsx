import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getFinanceDashboard } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/formatters';

function FinanceStaffDashboard() {
  const { data, loading, error } = useFetch(getFinanceDashboard, []);
  const navigate = useNavigate();

  const totals = data?.totals || { today: 0, this_month: 0, all_time: 0 };
  const byMinistry = data?.byMinistry || [];

  return (
    <PageWrapper title="Finance Staff Dashboard" accentColour="#117864">
      <h1>Finance staff dashboard</h1>

      {loading && <StatsSkeleton count={3} />}

      {!loading && error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <strong className="alert-title">Could not load payments</strong>
            <p className="alert-message">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <Card variant="bordered" className="stat-card">
              <div className="stat-body">
                <div className="stat-value">
                  {formatCurrency(totals.today)}
                </div>
                <div className="stat-label">Received today</div>
              </div>
            </Card>
            <Card variant="bordered" className="stat-card">
              <div className="stat-body">
                <div className="stat-value">
                  {formatCurrency(totals.this_month)}
                </div>
                <div className="stat-label">This month</div>
              </div>
            </Card>
            <Card variant="bordered" className="stat-card">
              <div className="stat-body">
                <div className="stat-value">
                  {formatCurrency(totals.all_time)}
                </div>
                <div className="stat-label">All time</div>
              </div>
            </Card>
          </div>

          <h2>Payments by ministry</h2>

          {byMinistry.length === 0 ? (
            <p className="text-muted">No payments recorded yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ministry</th>
                    <th>Payments</th>
                    <th>Total</th>
                    <th>Today</th>
                    <th>This month</th>
                  </tr>
                </thead>
                <tbody>
                  {byMinistry.map((row) => (
                    <tr key={row.ministry}>
                      <td>
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() =>
                            navigate(`/finance/payments?ministry=${row.ministry}`)
                          }
                        >
                          {row.ministry}
                        </button>
                      </td>
                      <td>{row.payment_count}</td>
                      <td>{formatCurrency(row.total_amount)}</td>
                      <td>{formatCurrency(row.today_amount)}</td>
                      <td>{formatCurrency(row.month_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="quick-actions" style={{ marginTop: 24 }}>
            <Button
              variant="primary"
              onClick={() => navigate('/finance/payments')}
            >
              View all payments
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/finance/processing')}
            >
              Process tax registrations
            </Button>
          </div>
        </>
      )}
    </PageWrapper>
  );
}

export default FinanceStaffDashboard;