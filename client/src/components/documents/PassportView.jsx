import { useMemo } from 'react';
import Alert from '../common/Alert';
import {
  buildMrzLines,
  formatPassportDate,
} from '../../utils/passportHelpers';

function isoDate(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function displayValue(value) {
  return value || 'Not recorded';
}

function nationalityCode(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'MOSOTHO' || normalized === 'LESOTHO') return 'LSO';
  return /^[A-Z]{3}$/.test(normalized) ? normalized : '';
}

function nationalityName(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'MOSOTHO' || normalized === 'LESOTHO' || normalized === 'LSO') {
    return 'LESOTHO';
  }
  return normalized || 'Not recorded';
}

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { surname: parts[0] || '', givenNames: '' };
  return {
    surname: parts[parts.length - 1],
    givenNames: parts.slice(0, -1).join(' '),
  };
}

function PassportView({ data, photoUrl }) {
  const isMinorPassport = Boolean(data.child_full_name);
  const holderName = data.child_full_name ||
    [data.first_name, data.last_name].filter(Boolean).join(' ');
  const nameParts = isMinorPassport
    ? splitFullName(holderName)
    : { surname: data.last_name || '', givenNames: data.first_name || '' };
  const birthDate = isoDate(data.child_date_of_birth || data.passport_birth_date);
  const issueDate = isoDate(data.issue_date || data.issued_at);
  const expiryDate = isoDate(data.expiry_date);
  const mrzSex = data.passport_gender === 'MALE'
    ? 'M'
    : data.passport_gender === 'FEMALE' ? 'F' : '';
  const nationality = nationalityCode(data.nationality);

  const { mrzLines, mrzError } = useMemo(() => {
    if (!data.passport_number || !birthDate || !expiryDate || !nationality) {
      return {
        mrzLines: null,
        mrzError: 'Machine-readable data is unavailable because a passport number, nationality, date of birth, or expiry date is missing.',
      };
    }
    try {
      return {
        mrzLines: buildMrzLines({
          issuingState: 'LSO',
          surname: nameParts.surname,
          givenNames: nameParts.givenNames,
          passportNumber: data.passport_number,
          nationality,
          birthDate,
          sex: mrzSex,
          expiryDate,
          personalNumber: data.national_id || data.child_national_id || '',
        }),
        mrzError: null,
      };
    } catch (error) {
      return { mrzLines: null, mrzError: error.message };
    }
  }, [
    birthDate,
    data.child_national_id,
    data.national_id,
    data.passport_number,
    expiryDate,
    mrzSex,
    nameParts.givenNames,
    nameParts.surname,
    nationality,
  ]);

  const statusLabels = {
    COLLECTED: 'Collected',
    COMPLETED: 'Collected',
    READY_FOR_COLLECTION: 'Ready for collection',
  };
  const status = statusLabels[data.status] || data.status;

  return (
    <article className="passport-page print-container" aria-label="Passport data page">
      <header className="passport-page-header">
        <div className="passport-document-title">
          <span>PASSPORT</span>
          <span>PASSEPORT</span>
        </div>
        <div className="passport-country-heading">
          <strong>KINGDOM OF LESOTHO</strong>
          <span>Issuing country / Pays émetteur</span>
          <b>LSO</b>
        </div>
        <img className="passport-emblem" src="/Logo.jpeg" alt="Kingdom of Lesotho emblem" />
      </header>

      <div className="passport-fields">
        <div className="passport-photo-frame">
          {photoUrl ? (
            <img src={photoUrl} alt="Passport holder" />
          ) : (
            <span>Photo unavailable</span>
          )}
        </div>

        <div className="passport-main-fields">
          <div className="passport-number-field">
            <span className="passport-field-label">Passport No / Passeport No</span>
            <strong>{displayValue(data.passport_number)}</strong>
          </div>

          <div className="passport-field passport-type">
            <span className="passport-field-label">Type</span>
            <strong>P</strong>
          </div>
          <div className="passport-field">
            <span className="passport-field-label">Surname / Nom</span>
            <strong>{displayValue(nameParts.surname)}</strong>
          </div>
          <div className="passport-field">
            <span className="passport-field-label">Given names / Prénoms</span>
            <strong>{displayValue(nameParts.givenNames)}</strong>
          </div>
          <div className="passport-field">
            <span className="passport-field-label">Nationality / Nationalité</span>
            <strong>{nationalityName(data.nationality)}</strong>
          </div>

          <div className="passport-field">
            <span className="passport-field-label">Date of birth / Date de naissance</span>
            <strong>{formatPassportDate(birthDate) || 'Not recorded'}</strong>
          </div>
          <div className="passport-field passport-sex">
            <span className="passport-field-label">Sex / Sexe</span>
            <strong>{mrzSex || 'Not recorded'}</strong>
          </div>
          <div className="passport-field passport-place">
            <span className="passport-field-label">Place of birth / Lieu de naissance</span>
            <strong>{displayValue(data.place_of_birth)}</strong>
          </div>

          <div className="passport-field">
            <span className="passport-field-label">Date of issue / Date de délivrance</span>
            <strong>{formatPassportDate(issueDate) || 'Not recorded'}</strong>
          </div>
          <div className="passport-field">
            <span className="passport-field-label">Date of expiry / Date d’expiration</span>
            <strong>{formatPassportDate(expiryDate) || 'Not recorded'}</strong>
          </div>
        </div>

        <aside className="passport-side-fields">
          <div className="passport-field">
            <span className="passport-field-label">National ID / No d’identité</span>
            <strong>{displayValue(data.child_national_id || data.national_id)}</strong>
          </div>
          <div className="passport-field">
            <span className="passport-field-label">Authority / Autorité</span>
            <strong>LSO</strong>
          </div>
          <div className="passport-signature">
            <span className="passport-field-label">Holder’s signature / signature du titulaire</span>
            {data.signature_data ? (
              <img src={data.signature_data} alt="Passport holder signature" />
            ) : (
              <span className="passport-signature-empty">Not recorded</span>
            )}
          </div>
          <div className="passport-collection">
            <span className="passport-field-label">Collection office</span>
            <strong>{displayValue(data.collection_branch || data.collection_office)}</strong>
          </div>
        </aside>
      </div>

      <div className="passport-mrz" aria-label="Machine-readable zone">
        {mrzLines ? (
          mrzLines.map((line) => <div key={line}>{line}</div>)
        ) : (
          <Alert type="warning" message={mrzError} />
        )}
      </div>

      {status && <span className="passport-status no-print">Status: {status}</span>}
    </article>
  );
}

export default PassportView;
