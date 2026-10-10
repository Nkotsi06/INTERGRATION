import { FiFileText, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';

function DocumentPreview({ document, onDownload, onView, onDelete }) {
  const isImage = document.fileType?.match(/jpg|jpeg|png/i);

  return (
    <div className="document-preview">
      <div className="document-preview-thumb">
        {isImage ? (
          <img src={document.fileUrl} alt={document.name} />
        ) : (
          <FiFileText className="document-icon" />
        )}
      </div>

      <div className="document-preview-info">
        <h4>{document.name || document.fileName}</h4>
        <p className="document-meta">
          {document.fileType?.toUpperCase()} · {document.uploadedAt}
        </p>
      </div>

      <div className="document-preview-actions">
        {onView && (
          <button
            type="button"
            onClick={() => onView(document)}
            aria-label="View document"
          >
            <FiEye />
          </button>
        )}
        {onDownload && (
          <button
            type="button"
            onClick={() => onDownload(document)}
            aria-label="Download document"
          >
            <FiDownload />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(document)}
            aria-label="Delete document"
          >
            <FiTrash2 />
          </button>
        )}
      </div>
    </div>
  );
}

export default DocumentPreview;