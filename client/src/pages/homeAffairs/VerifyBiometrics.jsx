import { useParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import FingerprintPreview from '../../components/biometrics/FingerprintPreview';
import FacialPreview from '../../components/biometrics/FacialPreview';
import BiometricStatusBadge from '../../components/biometrics/BiometricStatusBadge';
import useFetch from '../../hooks/useFetch';
import { getBiometrics } from '../../api/biometricApi';

function HAVerifyBiometrics() {
  const { id } = useParams();
  const { data: biometrics, loading } = useFetch(() => getBiometrics(id), [id]);
  const hasBiometrics =
    Object.values(biometrics?.fingerprints || {}).some(Boolean) ||
    Boolean(biometrics?.facialImage);

  return (
    <PageWrapper title="Verify Biometrics" showBack backPath={`/home-affairs/citizen/${id}`}>
      <h2>Verify Biometrics</h2>
      <BiometricStatusBadge enrolled={hasBiometrics} />
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

export default HAVerifyBiometrics;