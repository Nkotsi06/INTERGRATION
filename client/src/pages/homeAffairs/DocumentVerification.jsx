import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import apiClient from '../../api/apiClient';

function DocumentVerification() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!number) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await apiClient.get(
        `/information/verify-document?number=${encodeURIComponent(number.trim())}`
      );
      setResult(data);
    } catch (err) {
      setError(err.message || 'Could not verify the document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Document Verification" showBack backPath="/home-affairs/dashboard">
      <h1>Verify a Document</h1>
      <p className="text-muted">Enter a Certificate Number or National ID to verify its authenticity.</p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 400, marginBottom: 30 }}>
        <Input 
          label="Document Number" 
          value={number} 
          onChange={e => setNumber(e.target.value)} 
          placeholder="e.g. BC-2026-000001" 
        />
        <Button variant="primary" onClick={handleVerify} loading={loading}>Verify</Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {result && result.valid && (
        <Card variant="bordered" style={{ borderColor: '#27ae60', maxWidth: 500 }}>
          <h3 style={{ color: '#27ae60', marginBottom: 10 }}>✓ Valid Document</h3>
          <p><strong>Type:</strong> {result.type}</p>
          <p><strong>Number:</strong> {result.number}</p>
          {result.name && <p><strong>Name on Record:</strong> {result.name}</p>}
        </Card>
      )}

      {result && !result.valid && (
        <Alert type="error" title="Not Found" message="This document number does not exist in the system." />
      )}
    </PageWrapper>
  );
}

export default DocumentVerification;