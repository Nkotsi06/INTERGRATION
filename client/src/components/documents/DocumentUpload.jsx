import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import { validateFileType, validateFileSize, formatFileSize } from '../../utils/fileHelpers';
import { useNotification } from '../../context/NotificationContext';

function DocumentUpload({
  documentType,
  onUpload,
  acceptedFormats = 'pdf,jpg,jpeg,png',
  maxSizeMb = 5,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { error: showError } = useNotification();

  const handleSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!validateFileType(selected, acceptedFormats)) {
      showError(`Invalid file type. Accepted: ${acceptedFormats}`);
      return;
    }

    if (!validateFileSize(selected, maxSizeMb)) {
      showError(`File too large. Maximum size: ${maxSizeMb}MB`);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      await onUpload(formData);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      showError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="document-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.split(',').map((f) => `.${f.trim()}`).join(',')}
        onChange={handleSelect}
        style={{ display: 'none' }}
        id={`file-upload-${documentType}`}
      />

      {!file ? (
        <label htmlFor={`file-upload-${documentType}`} className="upload-dropzone">
          <FiUpload className="upload-icon" />
          <span className="upload-text">Click to select file</span>
          <span className="upload-hint">
            Accepted: {acceptedFormats} | Max: {maxSizeMb}MB
          </span>
        </label>
      ) : (
        <div className="upload-preview">
          <FiFile className="upload-file-icon" />
          <div className="upload-file-info">
            <span className="upload-file-name">{file.name}</span>
            <span className="upload-file-size">{formatFileSize(file.size)}</span>
          </div>
          <button className="upload-remove" onClick={handleRemove} aria-label="Remove file">
            <FiX />
          </button>
        </div>
      )}

      {file && (
        <button
          className="btn btn-primary upload-submit"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      )}
    </div>
  );
}

export default DocumentUpload;