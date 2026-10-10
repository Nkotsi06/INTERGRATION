import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import DocumentList from '../../components/documents/DocumentList';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useFetch from '../../hooks/useFetch';
import { getDocuments, downloadDocument, deleteDocument } from '../../api/documentApi';
import { useNotification } from '../../context/NotificationContext';

function MyDocuments() {
  const { data: documents, loading, refetch } = useFetch(getDocuments, []);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { success, error: showError } = useNotification();

  const handleDownload = async (doc) => {
    try {
      const blob = await downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = doc.fileName || 'document';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showError('Could not download this document.');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDocument(pendingDelete.id);
      success('Document deleted');
      setPendingDelete(null);
      refetch();
    } catch (err) {
      showError('Could not delete this document.');
    }
  };

  return (
    <PageWrapper title="My Documents" showBack backPath="/citizen/dashboard">
      <h1>My documents</h1>
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <DocumentList
          documents={documents}
          onDownload={handleDownload}
          onDelete={(doc) => setPendingDelete(doc)}
        />
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete this document?"
        message="This cannot be undone. You will need to upload it again if it is required later."
        confirmLabel="Delete document"
        variant="danger"
      />
    </PageWrapper>
  );
}

export default MyDocuments;