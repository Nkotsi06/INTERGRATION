function DocumentPreview({ document, onDownload, onView, onDelete }) {
  const isImage = document.fileType?.match(/jpg|jpeg|png/i);

  return (
    <div className="document-preview">
      <div className="document-preview-thumb">
        {isImage ? (
          <img src={document.fileUrl} alt={document.name} />
        ) : (
          <span className="document-thumb-label">FILE</span>
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
          <button type="button" onClick={() => onView(document)}>
            View
          </button>
        )}
        {onDownload && (
          <button type="button" onClick={() => onDownload(document)}>
            Download
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={() => onDelete(document)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default DocumentPreview;