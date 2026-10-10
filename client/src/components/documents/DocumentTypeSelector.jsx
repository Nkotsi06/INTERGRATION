import { useSettings } from '../../context/SettingsContext';

function DocumentTypeSelector({ value, onChange, required }) {
  const { settings } = useSettings();

  return (
    <div className="form-field">
      <label className="form-label">
        Document Type {required && <span className="required-mark">*</span>}
      </label>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select document type...</option>
        {settings.documentTypes?.map((type) => (
          <option key={type.code} value={type.code}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DocumentTypeSelector;