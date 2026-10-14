import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getTaxPolicy } from '../../api/financeApi';
import { formatDate } from '../../utils/formatters';

function TaxPolicyView() {
  const { data: notes, loading } = useFetch(getTaxPolicy, []);

  return (
    <PageWrapper title="Tax Policy" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Tax policy notes</h1>
      <p className="text-muted">
        Policy documents, guidance and announcements for Ministry of Finance staff.
      </p>

      {loading ? <p className="text-muted">Loading…</p>
        : !notes || notes.length === 0
          ? <EmptyState title="No tax policy notes" message="No documents yet." />
          : notes.map((n) => (
            <Card key={n.id} variant="flat" className="card-flat" style={{ marginBottom: 12 }}>
              <h3 style={{ marginTop: 0 }}>{n.title}</h3>
              {n.category && <p className="text-muted">Category: {n.category}</p>}
              {n.summary && <p>{n.summary}</p>}
              {n.full_text && <p style={{ whiteSpace: 'pre-wrap' }}>{n.full_text}</p>}
              {n.effective_from && (
                <p className="text-muted">
                  Effective from {formatDate(n.effective_from)}
                  {n.effective_until ? ` until ${formatDate(n.effective_until)}` : ''}
                </p>
              )}
            </Card>
          ))}
    </PageWrapper>
  );
}

export default TaxPolicyView;