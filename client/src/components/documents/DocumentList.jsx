import DocumentPreview from './DocumentPreview';
import EmptyState from '../common/EmptyState';

function DocumentList({ documents, onDownload, onView, onDelete }) {
  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        message="Documents you upload will appear here."
      />
    );
  }

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <DocumentPreview
          key={doc.id}
          document={doc}
          onDownload={onDownload}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default DocumentList;