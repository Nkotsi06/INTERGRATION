import { useParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import DocumentList from '../../components/documents/DocumentList';
import useFetch from '../../hooks/useFetch';
import { getCitizenById } from '../../api/homeAffairsApi';
import { getDocuments } from '../../api/documentApi';

function HAVerifyDocuments() {
  const { id } = useParams();
  const { data: documents, loading } = useFetch(() => getDocuments({ citizenId: id }), [id]);

  return (
    <PageWrapper title="Verify Documents" showBack backPath={`/home-affairs/citizen/${id}`}>
      <h2>Verify Documents</h2>
      {loading ? <p>Loading...</p> : <DocumentList documents={documents} onDownload={() => {}} onView={() => {}} />}
    </PageWrapper>
  );
}

export default HAVerifyDocuments;