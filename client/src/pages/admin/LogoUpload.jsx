import { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { uploadLogo } from '../../api/adminApi';

function LogoUpload() {
  const { settings, reload } = useSettings();
  const { success, error: showError } = useNotification();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(settings.systemLogoPath || '/logo.png');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.match(/image\/(png|jpeg|jpg|svg\+xml)/)) {
      setError('Please choose a PNG, JPG, or SVG image.');
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setError('File is larger than 2 MB.');
      return;
    }
    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      await uploadLogo(formData);
      await reload();
      success('Logo updated');
      setFile(null);
    } catch (err) {
      showError('Could not upload the logo.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(settings.systemLogoPath || '/logo.png');
  };

  return (
    <PageWrapper
      title="System Logo"
      showBack
      backPath="/admin/settings"
      accentColour="#2C3E50"
    >
      <h1>System logo</h1>
      <p className="text-muted">
        Recommended size 200×200 px. PNG, JPG, or SVG. Maximum 2 MB.
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="logo-preview">
        {preview ? (
          <img src={preview} alt="Current logo" />
        ) : (
          <span className="logo-placeholder">No logo uploaded yet</span>
        )}
      </div>

      <label htmlFor="logo-upload" className="btn btn-secondary">
        <FiUpload /> Select new logo
      </label>
      <input
        id="logo-upload"
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={handleSelect}
        style={{ display: 'none' }}
      />

      {file && (
        <FormActions
          primaryLabel="Upload logo"
          primaryLoading={uploading}
          onPrimary={handleUpload}
          onSecondary={handleCancel}
        />
      )}
    </PageWrapper>
  );
}

export default LogoUpload;