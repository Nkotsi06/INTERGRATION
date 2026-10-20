import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import useFetch from '../../hooks/useFetch';
import { getMyCertificates } from '../../api/certificateApi';
import { getProfile } from '../../api/citizenApi';
import apiClient from '../../api/apiClient';
import BirthCertificateView from '../../components/documents/BirthCertificateView';
import DeathCertificateView from '../../components/documents/DeathCertificateView';
import NationalIdCardView from '../../components/documents/NationalIdCardView';
import PassportView from '../../components/documents/PassportView';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

function formatTypeLabel(certificate) {
  if (certificate.certificate_type === 'ID_CARD') {
    return 'National ID card';
  }
  if (certificate.certificate_type === 'BIRTH') {
    return 'Birth certificate';
  }
  if (certificate.certificate_type === 'PASSPORT') {
    return 'Passport';
  }
  return `${certificate.certificate_type} certificate`;
}

function MyDocuments() {
  const { data: certificates, loading, error } = useFetch(getMyCertificates, [], {
    pollInterval: 30000,
  });
  const {
    data: profile,
    loading: profileLoading,
    error: profileError,
  } = useFetch(getProfile, []);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  useEffect(() => () => {
    if (photoUrl?.startsWith('blob:')) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const handleView = async (cert) => {
    setSelectedDoc(cert);
    setPhotoError(null);
    setPhotoUrl(cert.applicant_photo || null);
    if (cert.certificate_type === 'ID_CARD' ||
        (cert.certificate_type === 'PASSPORT' && !cert.applicant_photo)) {
      try {
        const blob = await apiClient.get('/citizen/photo', { responseType: 'blob' });
        setPhotoUrl(URL.createObjectURL(blob));
      } catch (err) {
        setPhotoUrl(null);
        setPhotoError(err.message || 'Could not load the document photo.');
      }
    }
  };

  return (
    <PageWrapper title="My Documents" showBack backPath="/citizen/dashboard">
      <h1>My Documents</h1>
      <p className="text-muted">
        View and print your official government documents.
      </p>

      {loading && <p>Loading documents...</p>}
      {!loading && error && <Alert type="error" message={error} />}

      {!selectedDoc && !error && Array.isArray(certificates) && certificates.map((cert) => (
        <div
          key={`${cert.certificate_type}-${cert.id}`}
          className="card card-flat"
          style={{ marginBottom: 10, padding: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <strong>{formatTypeLabel(cert)}</strong>
            <p className="text-muted" style={{ margin: 0 }}>
              {cert.certificate_type === 'ID_CARD'
                ? cert.card_number
                : cert.certificate_type === 'PASSPORT'
                  ? cert.passport_number
                  : cert.certificate_number}
            </p>
          </div>
          <Button variant="primary" onClick={() => handleView(cert)}>
            View
          </Button>
        </div>
      ))}

      {!selectedDoc && !error && Array.isArray(certificates) && certificates.length === 0 && (
        <p className="text-muted">
          You have no documents yet. Certificates, National ID cards, and passports
          appear here once they have been issued.
        </p>
      )}

      {!selectedDoc && profileError && (
        <Alert
          type="error"
          message="Your citizen profile could not be loaded. Your document list is still available, but profile details cannot be displayed."
        />
      )}

      {selectedDoc && (
        <div style={{ marginTop: 20 }}>
          <div className="no-print" style={{ marginBottom: 20 }}>
            <Button variant="secondary" onClick={() => setSelectedDoc(null)}>
              Back to list
            </Button>
            <Button
              variant="primary"
              onClick={() => window.print()}
              style={{ marginLeft: 10 }}
            >
              Print Document
            </Button>
          </div>

          {selectedDoc.certificate_type === 'BIRTH' && (
            <BirthCertificateView data={selectedDoc} />
          )}
          {selectedDoc.certificate_type === 'DEATH' && (
            <DeathCertificateView data={selectedDoc} />
          )}
          {selectedDoc.certificate_type === 'ID_CARD' && (
            profile ? (
              <NationalIdCardView
                data={{ ...profile, signatureData: selectedDoc.signature_data }}
                photoUrl={photoUrl}
              />
            ) : (
              <Alert
                type="error"
                message={profileLoading
                  ? 'Loading your citizen profile...'
                  : profileError || 'Your citizen profile is not available, so the ID card cannot be displayed.'}
              />
            )
          )}
          {selectedDoc.certificate_type === 'PASSPORT' && (
            <>
              {photoError && <Alert type="error" message={photoError} />}
              <PassportView data={selectedDoc} photoUrl={photoUrl} />
            </>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

export default MyDocuments;