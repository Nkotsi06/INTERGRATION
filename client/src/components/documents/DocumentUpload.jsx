import { useRef, useState } from 'react';
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
} from '../../utils/fileHelpers';
import { useNotification } from '../../context/NotificationContext';

function DocumentUpload({
  documentType,
  label,
  onUpload,
  acceptedFormats = 'pdf,jpg,jpeg,png',
  maxSizeMb = 5,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);
  const { error: showError, success } = useNotification();

  const reset = () => {
    setFile(null);
    setProgress(0);
    setCancelled(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    setProgress(0);
    setCancelled(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      // onUpload may return a promise; pass the progress reporter.
      await onUpload(formData, {
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
        signal: abortRef.current?.signal,
      });

      success('Document uploaded');
      reset();
    } catch (err) {
      if (err?.name === 'CanceledError' || cancelled) {
        showError('Upload cancelled.');
      } else {
        showError('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    setCancelled(true);
    abortRef.current?.abort();
    abortRef.current = null;
    setUploading(false);
    setProgress(0);
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

      {label && <label className="form-label">{label}</label>}

      {!file ? (
        <label
          htmlFor={`file-upload-${documentType}`}
          className="upload-dropzone"
        >
          <span className="upload-text">Click to select file</span>
          <span className="upload-hint">
            Accepted: {acceptedFormats} | Max: {maxSizeMb}MB
          </span>
        </label>
      ) : (
        <div className="upload-preview">
          <div className="upload-file-info">
            <span className="upload-file-name">{file.name}</span>
            <span className="upload-file-size">{formatFileSize(file.size)}</span>
          </div>
          {!uploading && (
            <button
              type="button"
              className="upload-remove"
              onClick={reset}
              aria-label="Remove file"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {file && uploading && (
        <div className="upload-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div
            className="upload-progress-fill"
            style={{ width: `${progress}%` }}
          />
          <span className="upload-progress-label">{progress}%</span>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}

      {file && !uploading && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUpload}
        >
          Upload document
        </button>
      )}
    </div>
  );
}

export default DocumentUpload;