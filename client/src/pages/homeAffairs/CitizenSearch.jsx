import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { searchCitizen } from '../../api/homeAffairsApi';

function HACitizenSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const citizen = await searchCitizen({ query: query.trim() });
      if (!citizen) {
        setError('No citizen found with those details.');
        return;
      }
      setResult(citizen);
    } catch (err) {
      setError(err.message || 'Could not search citizen records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Citizen Search"
      showBack
      backPath="/home-affairs/dashboard"
      accentColour="#1A5276"
    >
      <h1>Citizen search</h1>
      <p className="text-muted">
        Search by National ID, full name, or username.
      </p>

      <form onSubmit={handleSearch} noValidate>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <Input
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 198503150012 or Teboho Nko"
          />
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Search
          </Button>
        </div>
      </form>

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="card card-bordered" style={{ marginTop: 16 }}>
          <h3>{result.fullName || result.username}</h3>
          <div className="profile-rows">
            <div className="profile-row">
              <span>National ID</span>
              <strong>{result.nationalId || 'Not yet generated'}</strong>
            </div>
            <div className="profile-row">
              <span>Status</span>
              <StatusBadge
                variant={
                  result.isVerified
                    ? 'verified'
                    : result.nationalId
                    ? 'captured'
                    : 'awaiting'
                }
              />
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() =>
              navigate(`/home-affairs/citizen/${result.id}`)
            }
          >
            View citizen profile
          </Button>
        </div>
      )}
    </PageWrapper>
  );
}

export default HACitizenSearch;