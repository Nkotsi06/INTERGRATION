import PageWrapper from '../../components/layout/PageWrapper';
import BiometricStatusBadge from '../../components/biometrics/BiometricStatusBadge';
import FingerprintPreview from '../../components/biometrics/FingerprintPreview';
import FacialPreview from '../../components/biometrics/FacialPreview';
import useFetch from '../../hooks/useFetch';
import { getBiometrics } from '../../api/citizenApi';

function MyBiometrics() {
  const { data: biometrics, loading } = useFetch(getBiometrics, []);

  return (
    <PageWrapper title="My Biometrics" showBack backPath="/citizen/dashboard">
      <h2>My Biometrics</h2>
      <BiometricStatusBadge enrolled={!!biometrics?.fingerprints} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3>Fingerprints</h3>
          <FingerprintPreview fingerprints={biometrics?.fingerprints || {}} />
          <h3>Facial Photo</h3>
          <FacialPreview image={biometrics?.facialImage} />
        </>
      )}
    </PageWrapper>
  );
}

export default MyBiometrics;