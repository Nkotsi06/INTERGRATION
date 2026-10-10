import { useState } from 'react';
import { uploadDocument } from '../api/documentApi';
import { useNotification } from '../context/NotificationContext';

function useDocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const { success, error: showError } = useNotification();

  const upload = async (formData) => {
    setUploading(true);
    try {
      const result = await uploadDocument(formData);
      success('Document uploaded successfully');
      return result;
    } catch (err) {
      showError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, upload };
}

export default useDocumentUpload;