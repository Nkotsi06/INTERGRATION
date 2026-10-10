import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { checkDeathCertificate } from '../../api/pensionsApi';

function DeathCertificateCheck() {
  const [nationalId, setNationalId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);
    try {
      const r = await checkDeathCertificate(nationalId);
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Death Certificate Check" showBack backPath="/pensions/staff" accentColour="#7D3C98">
      <h2>Death Certificate Check</h2>
      <Input label="National ID" value={nationalId} onChange={(e) => setNationalId(e.target.value)} required />
      <Button variant="primary" onClick={handleCheck} disabled={loading}>{loading ? 'Checking...' : 'Check'}</Button>
      {result && (
        <Alert type={result.found ? 'error' : 'success'} message={result.found ? `Death certificate on record (${result.date})` : 'No death certificate on record'} />
      )}
    </PageWrapper>
  );
}

export default DeathCertificateCheck;