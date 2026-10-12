import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getCertificates } from '../../api/homeAffairsApi';
import { formatDate } from '../../utils/formatters';

function HACertificates() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, refetch } = useFetch(() => getCertificates(id), [id]);

  return (
    <PageWrapper
      title="Certificates"
      showBack
      backPath={`/home-affairs/citizen/${id}`}
      accentColour="#1A5276"
    >
      <h1>Certificates</h1>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate(`/home-affairs/citizen/${id}/certificates/new?type=birth`)}>
          Issue birth certificate
        </Button>
        <Button variant="primary" onClick={() => navigate(`/home-affairs/citizen/${id}/certificates/new?type=marriage`)}>
          Issue marriage certificate
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/home-affairs/citizen/${id}/certificates/new?type=death`)}>
          Issue death certificate
        </Button>
        <Button variant="ghost" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          <Section title="Birth certificates" items={data?.birth || []} renderItem={renderBirth} />
          <Section title="Marriage certificates" items={data?.marriage || []} renderItem={renderMarriage} />
          <Section title="Death certificates" items={data?.death || []} renderItem={renderDeath} />
        </>
      )}
    </PageWrapper>
  );
}

function Section({ title, items, renderItem }) {
  return (
    <div className="form-section">
      <h3 className="form-section-title">{title}</h3>
      {items.length === 0 ? (
        <p className="text-muted">None on record.</p>
      ) : (
        items.map((it) => (
          <Card key={it.id} variant="flat" className="card-flat" style={{ marginBottom: 12 }}>
            {renderItem(it)}
          </Card>
        ))
      )}
    </div>
  );
}

function renderBirth(c) {
  return (
    <>
      <strong>Number: {c.certificate_number}</strong>
      <p>Date of birth: {formatDate(c.date_of_birth)}</p>
      <p>Place: {c.place_of_birth || '—'}</p>
      <p className="text-muted">Issued {formatDate(c.issued_at)}</p>
    </>
  );
}

function renderMarriage(c) {
  return (
    <>
      <strong>Number: {c.certificate_number}</strong>
      <p>Marriage date: {formatDate(c.marriage_date)}</p>
      <p>Place: {c.place_of_marriage || '—'}</p>
      <p className="text-muted">Issued {formatDate(c.issued_at)}</p>
    </>
  );
}

function renderDeath(c) {
  return (
    <>
      <strong>Number: {c.certificate_number}</strong>
      <p>Date of death: {formatDate(c.date_of_death)}</p>
      <p>Place: {c.place_of_death || '—'}</p>
      <p className="text-muted">Registered {formatDate(c.registered_at)}</p>
    </>
  );
}

export default HACertificates;