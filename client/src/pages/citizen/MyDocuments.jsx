import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import useFetch from '../../hooks/useFetch';
import { getMyCertificates } from '../../api/certificateApi';
import { getProfile } from '../../api/citizenApi';
import apiClient from '../../api/apiClient';
import BirthCertificateView from '../../components/documents/BirthCertificateView';
import DeathCertificateView from '../../components/documents/DeathCertificateView';
import NationalIdCardView from '../../components/documents/NationalIdCardView';
import Button from '../../components/common/Button';

function MyDocuments() {
  const { data: certificates, loading } = useFetch(getMyCertificates, []);
  const { data: profile } = useFetch(getProfile, []);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const handleView = async (cert) => {
    setSelectedDoc(cert);
    // Fetch photo if viewing an ID Card
    if (cert.certificate_type === 'ID_CARD') {
      try {
        const blob = await apiClient.get('/citizen/photo', { responseType: 'blob' });
        setPhotoUrl(URL.createObjectURL(blob));
      } catch (err) {
        setPhotoUrl(null);
      }
    }
  };

  return (
    <PageWrapper title="My Documents" showBack backPath="/citizen/dashboard">
      <h1>My Documents</h1>
      <p className="text-muted">View and print your official government documents.</p>

      {loading && <p>Loading documents...</p>}

      {/* List of documents */}
      {!selectedDoc && certificates?.map((cert) => (
        <div key={cert.id} className="card card-flat" style={{ marginBottom: 10, padding: 15, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>{cert.certificate_type} CERTIFICATE</strong>
            <p className="text-muted">{cert.certificate_number}</p>
          </div>
          <Button variant="primary" onClick={() => handleView(cert)}>View</Button>
        </div>
      ))}

      {/* Document Viewer */}
      {selectedDoc && (
        <div style={{ marginTop: 20 }}>
          <div className="no-print" style={{ marginBottom: 20 }}>
            <Button variant="secondary" onClick={() => setSelectedDoc(null)}>Back to list</Button>
            <Button variant="primary" onClick={() => window.print()} style={{ marginLeft: 10 }}>Print Document</Button>
          </div>

          {selectedDoc.certificate_type === 'BIRTH' && <BirthCertificateView data={selectedDoc} />}
          {selectedDoc.certificate_type === 'DEATH' && <DeathCertificateView data={selectedDoc} />}
          {selectedDoc.certificate_type === 'ID_CARD' && <NationalIdCardView data={profile} photoUrl={photoUrl} />}
        </div>
      )}
    </PageWrapper>
  );
}

export default MyDocuments;